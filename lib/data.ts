// 데이터 로더 — 실데이터(키 있을 때) ↔ fixture 폴백을 한 곳에서 관리.
// API 라우트와 서버 컴포넌트가 공통으로 사용.

import { getBids } from "./g2b";
import { getPrices } from "./kamis";
import { analyzeBid } from "./ai-analyze";
import {
  fixtureBids,
  fixturePrices,
  fixtureAnalysis,
} from "./fixtures";
import { hasG2bKey, hasKamisKey, hasAiKey, matchesFilter } from "./config";
import type {
  AnalysisReport,
  ApiEnvelope,
  Bid,
  PriceItem,
  Region,
} from "./types";

const nowIso = () => new Date().toISOString();

function filteredFixtureBids(region: Region): Bid[] {
  return fixtureBids().filter((b) =>
    matchesFilter(`${b.bidNtceNm} ${b.dminsttNm} ${b.rgnNm}`, region),
  );
}

export async function loadBids(region: Region): Promise<ApiEnvelope<Bid[]>> {
  if (hasG2bKey()) {
    try {
      const data = await getBids({ region });
      if (data.length > 0) {
        return { data, usingFixtures: false, fetchedAt: nowIso() };
      }
      // 실데이터에 해당 지역 급식 공고가 없으면 데모로 채워 화면이 비지 않게.
      return {
        data: filteredFixtureBids(region),
        usingFixtures: true,
        fetchedAt: nowIso(),
        notice:
          "최근 7일 실데이터에서 이 지역 급식 공고가 없어 데모 데이터 표시 중 (지역 파라미터 확정 후 정밀 필터 예정)",
      };
    } catch (err) {
      return {
        data: filteredFixtureBids(region),
        usingFixtures: true,
        fetchedAt: nowIso(),
        notice: `나라장터 호출 실패로 데모 데이터 표시: ${(err as Error).message}`,
      };
    }
  }
  return {
    data: filteredFixtureBids(region),
    usingFixtures: true,
    fetchedAt: nowIso(),
    notice: "G2B_SERVICE_KEY 미설정 — 데모 데이터 표시 중",
  };
}

export async function loadPrices(): Promise<ApiEnvelope<PriceItem[]>> {
  if (hasKamisKey()) {
    try {
      const data = await getPrices();
      if (data.length > 0) return { data, usingFixtures: false, fetchedAt: nowIso() };
      return {
        data: fixturePrices(),
        usingFixtures: true,
        fetchedAt: nowIso(),
        notice: "KAMIS 응답이 비어 데모 데이터 표시 중 (품목 코드 확인 필요)",
      };
    } catch (err) {
      return {
        data: fixturePrices(),
        usingFixtures: true,
        fetchedAt: nowIso(),
        notice: `KAMIS 호출 실패로 데모 데이터 표시: ${(err as Error).message}`,
      };
    }
  }
  return {
    data: fixturePrices(),
    usingFixtures: true,
    fetchedAt: nowIso(),
    notice: "KAMIS_CERT_KEY/ID 미설정 — 데모 데이터 표시 중",
  };
}

function relevantPrices(bid: Bid, prices: PriceItem[]): PriceItem[] {
  const text = bid.bidNtceNm;
  const matched = prices.filter(
    (p) =>
      text.includes(p.itemName.replace(/\(.+\)/, "")) ||
      text.includes(p.category),
  );
  return matched.length > 0 ? matched : prices;
}

export async function loadAnalysis(
  bid: Bid,
): Promise<ApiEnvelope<AnalysisReport>> {
  const prices = (await loadPrices()).data;
  const context = relevantPrices(bid, prices.length ? prices : fixturePrices());

  if (!hasAiKey()) {
    return {
      data: fixtureAnalysis(bid),
      usingFixtures: true,
      fetchedAt: nowIso(),
      notice:
        "AI 키(ANTHROPIC_API_KEY/AI_GATEWAY_API_KEY) 미설정 — 데모 분석 표시 중",
    };
  }
  try {
    return { data: await analyzeBid(bid, context), usingFixtures: false, fetchedAt: nowIso() };
  } catch (err) {
    return {
      data: fixtureAnalysis(bid),
      usingFixtures: true,
      fetchedAt: nowIso(),
      notice: `AI 분석 실패로 데모 분석 표시: ${(err as Error).message}`,
    };
  }
}
