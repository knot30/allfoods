// 나라장터 입찰공고정보서비스 클라이언트 (물품: getBidPblancListInfoThng).
// 서버에서만 호출. 키 없으면 호출하지 않고 상위에서 fixture 폴백.

import { unstable_cache } from "next/cache";
import {
  G2B_BASE_URL,
  G2B_SERVICE_KEY,
  G2B_NUM_ROWS,
  hasFoodKeyword,
  inRegion,
} from "./config";
import type { Bid, Region } from "./types";

/** YYYYMMDDHHmm */
function stamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `${p(d.getHours())}${p(d.getMinutes())}`
  );
}

/** "20260612093000" 또는 "2026-06-12 09:30:00" → ISO */
function toIso(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const digits = s.replace(/[^0-9]/g, "");
  if (digits.length >= 12) {
    const [y, mo, d, h, mi] = [
      digits.slice(0, 4),
      digits.slice(4, 6),
      digits.slice(6, 8),
      digits.slice(8, 10),
      digits.slice(10, 12),
    ];
    const dt = new Date(`${y}-${mo}-${d}T${h}:${mi}:00+09:00`);
    return Number.isNaN(dt.getTime()) ? "" : dt.toISOString();
  }
  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? "" : dt.toISOString();
}

function num(raw: unknown): number | null {
  const n = Number(String(raw ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

interface G2bItem {
  bidNtceNo?: string;
  bidNtceOrd?: string;
  bidNtceNm?: string;
  ntceInsttNm?: string;
  dminsttNm?: string;
  bidNtceDt?: string;
  bidClseDt?: string;
  opengDt?: string;
  presmptPrce?: string;
  bssamt?: string;
  bidMethdNm?: string;
  /** 지역제한 장소 판단기준명 (지역제한 공고면 "경상북도 예천군" 등, 전국이면 "") */
  rgnLmtBidLocplcJdgmBssNm?: string;
  bidNtceDtlUrl?: string;
}

function extractItems(json: unknown): G2bItem[] {
  const body = (json as Record<string, any>)?.response?.body;
  if (!body) return [];
  const items = body.items;
  if (Array.isArray(items)) return items as G2bItem[];
  if (items && Array.isArray(items.item)) return items.item as G2bItem[];
  if (items?.item && typeof items.item === "object") return [items.item];
  return [];
}

function normalize(it: G2bItem): Bid {
  const ord = it.bidNtceOrd ? `-${it.bidNtceOrd}` : "";
  return {
    bidNtceNo: `${it.bidNtceNo ?? "?"}${ord}`,
    bidNtceNm: it.bidNtceNm ?? "(공고명 없음)",
    dminsttNm: it.dminsttNm ?? it.ntceInsttNm ?? "",
    ntceInsttNm: it.ntceInsttNm ?? "",
    bidNtceDt: toIso(it.bidNtceDt),
    bidClseDt: toIso(it.bidClseDt ?? it.opengDt),
    presmptPrce: num(it.presmptPrce ?? it.bssamt),
    rgnNm: it.rgnLmtBidLocplcJdgmBssNm ?? "",
    bidMethdNm: it.bidMethdNm ?? "",
    detailUrl:
      it.bidNtceDtlUrl ??
      "https://www.g2b.go.kr/",
    source: "g2b" as const,
  };
}

export interface GetBidsOptions {
  region: Region;
  /** 조회 기간(일). 기본 7일 */
  days?: number;
}

/** 나라장터에서 최근 N일 물품 공고를 조회하고 식자재+지역 필터를 적용. */
export async function getBids(opts: GetBidsOptions): Promise<Bid[]> {
  const days = opts.days ?? 7;
  const end = new Date();
  const begin = new Date(end);
  begin.setDate(begin.getDate() - days);

  const params = new URLSearchParams({
    serviceKey: G2B_SERVICE_KEY,
    pageNo: "1",
    numOfRows: String(G2B_NUM_ROWS),
    type: "json",
    inqryDiv: "1",
    inqryBgnDt: stamp(begin),
    inqryEndDt: stamp(end),
  });

  const url = `${G2B_BASE_URL}/getBidPblancListInfoThng?${params.toString()}`;
  // 응답이 3MB 를 넘어 Next 데이터 캐시(2MB 한도)에 안 들어가므로 no-store.
  // 캐싱은 라우트/페이지 레벨 revalidate 로 처리.
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (allfoods)" }, // 일부 WAF 가 기본 UA 차단
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`G2B HTTP ${res.status}`);

  const text = await res.text();
  // 키 오류 등은 XML 에러로 오는 경우가 있어 JSON 파싱 가드.
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`G2B 응답 파싱 실패 (키/엔드포인트 확인): ${text.slice(0, 120)}`);
  }

  const bids = extractItems(json).map(normalize);
  return bids
    .filter(
      (b) =>
        // 식자재: 공고명 기준 / 지역: 수요기관·지역제한 필드 기준 (오탐 방지)
        hasFoodKeyword(`${b.bidNtceNm} ${b.dminsttNm}`) &&
        inRegion(`${b.dminsttNm} ${b.rgnNm}`, opts.region),
    )
    .sort((a, b) => a.bidClseDt.localeCompare(b.bidClseDt));
}

/** getBids 의 캐시 래퍼. 3MB 원본은 캐시 못 하므로(2MB 한도) 정규화된 결과만 10분 캐시.
 *  → 첫 호출만 정부 API 왕복(수 초), 이후 동일 지역 요청은 즉시 응답. */
export function getBidsCached(opts: GetBidsOptions): Promise<Bid[]> {
  const days = opts.days ?? 7;
  return unstable_cache(
    () => getBids({ region: opts.region, days }),
    ["g2b-bids", opts.region, String(days)],
    { revalidate: 600, tags: ["g2b-bids"] },
  )();
}
