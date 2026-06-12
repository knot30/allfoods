// 데모용 fixture 데이터. 외부 API 키가 없을 때 폴백으로 사용.
// 날짜는 호출 시점 기준 상대값으로 생성 → 항상 "오늘 신규 / 마감 임박"이 보이게.

import { MEAL_ITEMS } from "./kamis";
import type { Bid, PriceItem, PricePoint } from "./types";

// 결정적 의사난수 (품목/공고별 시드) — 렌더마다 값이 출렁이지 않게.
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) + 1;
}

function iso(daysFromNow: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const G2B_DETAIL =
  "https://www.g2b.go.kr/pt/menu/selectSubFrame.do?framesrc=/pt/menu/frameTgong.do";

// ── 입찰 공고 fixtures ─────────────────────────────────────────
// 예천/영주 1차 + 경북 북부 + 경북 광역. 공고명에 지역+식자재 키워드 포함.
interface RawBid {
  no: string;
  nm: string;
  dminstt: string;
  rgn: string;
  prce: number | null;
  method: string;
  /** 공고 경과일(음수) / 마감까지 일수(양수) */
  noticeDaysAgo: number;
  closeInDays: number;
}

const RAW_BIDS: RawBid[] = [
  { no: "20260612-00231-00", nm: "2026년 7월 예천군 학교급식 식자재(농산물) 구매", dminstt: "예천교육지원청", rgn: "경상북도 예천군", prce: 184_500_000, method: "제한경쟁", noticeDaysAgo: 0, closeInDays: 1 },
  { no: "20260612-01187-00", nm: "영주시 관내 학교 친환경 쌀 공급 단가계약", dminstt: "영주교육지원청", rgn: "경상북도 영주시", prce: 96_200_000, method: "제한경쟁", noticeDaysAgo: 0, closeInDays: 2 },
  { no: "20260611-00942-00", nm: "예천여자고등학교 2학기 부식(축산물) 납품", dminstt: "예천여자고등학교", rgn: "경상북도 예천군", prce: 41_800_000, method: "소액수의", noticeDaysAgo: 1, closeInDays: 3 },
  { no: "20260611-02034-00", nm: "영주 중앙초등학교 급식 채소류 납품업체 선정", dminstt: "영주중앙초등학교", rgn: "경상북도 영주시", prce: 28_400_000, method: "제한경쟁", noticeDaysAgo: 1, closeInDays: 4 },
  { no: "20260610-00771-00", nm: "안동시 학교급식지원센터 농산물 공급 입찰", dminstt: "안동시학교급식지원센터", rgn: "경상북도 안동시", prce: 312_000_000, method: "일반경쟁", noticeDaysAgo: 2, closeInDays: 5 },
  { no: "20260610-01290-00", nm: "문경교육지원청 관내 학교 김치류 납품", dminstt: "문경교육지원청", rgn: "경상북도 문경시", prce: 52_700_000, method: "제한경쟁", noticeDaysAgo: 2, closeInDays: 6 },
  { no: "20260609-00558-00", nm: "봉화군 학교급식 식자재(수산물) 구매", dminstt: "봉화교육지원청", rgn: "경상북도 봉화군", prce: 33_900_000, method: "제한경쟁", noticeDaysAgo: 3, closeInDays: 2 },
  { no: "20260609-01622-00", nm: "경상북도교육청 친환경농산물 통합 공급 단가계약", dminstt: "경상북도교육청", rgn: "경상북도", prce: 1_240_000_000, method: "일반경쟁", noticeDaysAgo: 3, closeInDays: 8 },
  { no: "20260608-00410-00", nm: "상주시 관내 초·중학교 급식 우유 납품", dminstt: "상주교육지원청", rgn: "경상북도 상주시", prce: 67_500_000, method: "제한경쟁", noticeDaysAgo: 4, closeInDays: 7 },
  { no: "20260608-01904-00", nm: "예천군 어린이집 연합 부식(계란·두부) 구매", dminstt: "예천군육아종합지원센터", rgn: "경상북도 예천군", prce: 12_300_000, method: "소액수의", noticeDaysAgo: 4, closeInDays: 1 },
  { no: "20260607-00733-00", nm: "영양군 학교급식 농산물 공급업체 선정", dminstt: "영양교육지원청", rgn: "경상북도 영양군", prce: 24_600_000, method: "제한경쟁", noticeDaysAgo: 5, closeInDays: 9 },
  { no: "20260606-01345-00", nm: "영주시립요양원 급식 식자재 납품 단가계약", dminstt: "영주시립요양원", rgn: "경상북도 영주시", prce: 58_900_000, method: "제한경쟁", noticeDaysAgo: 6, closeInDays: 4 },
];

export function fixtureBids(): Bid[] {
  return RAW_BIDS.map((b) => ({
    bidNtceNo: b.no,
    bidNtceNm: b.nm,
    dminsttNm: b.dminstt,
    ntceInsttNm: b.dminstt,
    bidNtceDt: iso(-b.noticeDaysAgo, 9, 30),
    bidClseDt: iso(b.closeInDays, 11, 0),
    presmptPrce: b.prce,
    rgnNm: b.rgn,
    bidMethdNm: b.method,
    detailUrl: G2B_DETAIL,
    source: "fixture" as const,
  }));
}

// ── 가격 추적 fixtures ─────────────────────────────────────────
function fixtureSeries(seed: number, base: number): PricePoint[] {
  const rnd = seeded(seed);
  const pts: PricePoint[] = [];
  let value = base * (0.9 + rnd() * 0.1); // 한 달 전 시작점
  const trend = (rnd() - 0.45) * 0.004; // 완만한 추세
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const noise = (rnd() - 0.5) * 0.05;
    value = value * (1 + trend + noise);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    pts.push({ date: `${y}-${m}-${day}`, price: Math.round(value / 10) * 10 });
  }
  return pts;
}

export function fixturePrices(): PriceItem[] {
  return MEAL_ITEMS.map((item) => {
    const series = fixtureSeries(hash(item.itemCode), item.basePrice);
    const latest = series[series.length - 1].price;
    const prevMonth = series[0].price;
    const changePct =
      Math.round(((latest - prevMonth) / prevMonth) * 1000) / 10;
    return {
      itemCode: item.itemCode,
      itemName: item.name,
      unit: item.unit,
      category: item.category,
      latest,
      prevMonth,
      changePct,
      series,
      source: "fixture" as const,
    };
  });
}

/** AI 키가 없을 때 보여줄 데모 분석 리포트 */
export function fixtureAnalysis(bid: Bid) {
  const base = bid.presmptPrce ?? 50_000_000;
  return {
    fitness: bid.rgnNm.includes("예천") || bid.rgnNm.includes("영주")
      ? ("상" as const)
      : ("중" as const),
    fitnessReason:
      "연고 지역(예천·영주) 기반 물류 동선과 겹쳐 배송 효율이 높고, 지역제한 자격 요건을 충족할 가능성이 큽니다. 과거 유사 급식 식자재 공고와 품목 구성이 유사합니다.",
    costComment:
      "최근 30일 도매가 기준 채소·축산 단가는 안정세입니다. 다만 배추·무는 계절 변동성이 커 납품 기간 중 단가 상승 리스크를 반영해야 합니다.",
    recommendedBidRange: {
      low: Math.round((base * 0.88) / 1000) * 1000,
      high: Math.round((base * 0.95) / 1000) * 1000,
      basis: "기초금액 대비 88~95% 구간. 지역제한 경쟁 강도와 최근 낙찰 하한율을 고려한 추정.",
    },
    risks: [
      "납품 기간 중 채소류 도매가 급등 시 마진 압박",
      "지역제한 자격(소재지·실적) 미충족 가능성 확인 필요",
      "수요기관 검수 기준(친환경 인증 등) 사전 확인 필요",
    ],
    summary:
      "연고 지역 기반의 적합도 높은 공고로, 기초금액 대비 88~95% 구간 투찰을 권장합니다. (데모 분석 — 실제 분석은 AI 키 연결 후 제공)",
  };
}
