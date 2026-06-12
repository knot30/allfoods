// 환경설정 + 필터 상수. 외부 키는 전부 서버 전용 env 에서만 읽는다.

import type { Region } from "./types";

/** 나라장터 입찰공고정보서비스 base URL.
 *  차세대 개편으로 경로에 `/ad/` 세그먼트가 들어갈 수 있어 env 로 분리.
 *  키 발급 후 Swagger 콘솔에서 정확한 경로를 확인해 .env 에서 교체할 것.
 *  후보 1: https://apis.data.go.kr/1230000/ad/BidPublicInfoService
 *  후보 2: https://apis.data.go.kr/1230000/BidPublicInfoService */
// ※ 실측 확인(2026-06): 이 엔드포인트는 HTTPS 가 403(Forbidden), HTTP 로만 정상 응답.
//   경로의 `/ad/` 세그먼트도 실측으로 확정됨.
export const G2B_BASE_URL =
  process.env.G2B_BASE_URL ??
  "http://apis.data.go.kr/1230000/ad/BidPublicInfoService";

/** 한 번에 받아올 공고 수. 전국 물품공고가 많아 지역 필터 적중률을 높이려 크게 잡음. */
export const G2B_NUM_ROWS = Number(process.env.G2B_NUM_ROWS ?? "500");

export const G2B_SERVICE_KEY = process.env.G2B_SERVICE_KEY ?? "";

export const KAMIS_BASE_URL =
  process.env.KAMIS_BASE_URL ?? "https://www.kamis.or.kr/service/price/xml.do";
export const KAMIS_CERT_KEY = process.env.KAMIS_CERT_KEY ?? "";
export const KAMIS_CERT_ID = process.env.KAMIS_CERT_ID ?? "";

/** AI 분석 모델. AI Gateway 사용 시 'anthropic/claude-...' 형태, 직접 호출 시 'claude-...'. */
export const ANALYZE_MODEL = process.env.ANALYZE_MODEL ?? "claude-sonnet-4-6";

export const hasG2bKey = () => G2B_SERVICE_KEY.trim().length > 0;
export const hasKamisKey = () =>
  KAMIS_CERT_KEY.trim().length > 0 && KAMIS_CERT_ID.trim().length > 0;
export const hasAiKey = () =>
  (process.env.ANTHROPIC_API_KEY ?? "").trim().length > 0 ||
  (process.env.AI_GATEWAY_API_KEY ?? "").trim().length > 0;

/** 캐시(초). 정부 API 일일 호출 한도 보호용. */
export const REVALIDATE_SECONDS = 60;

// ── 필터 키워드 ───────────────────────────────────────────────

/** 학교급식 식자재 관련 공고를 거르는 키워드 */
export const FOOD_KEYWORDS = [
  "급식",
  "식자재",
  "식재료",
  "농산물",
  "부식",
  "쌀",
  "김치",
  "축산",
  "수산",
  "과일",
  "채소",
  "우유",
  "계란",
  "두부",
  "친환경",
] as const;

/** 1차 타깃: 연고 지역 */
const REGION_LOCAL = ["예천", "영주"];
/** 경북 북부권 확장 */
const REGION_GB_NORTH = [
  "안동",
  "문경",
  "상주",
  "봉화",
  "영양",
  "청송",
  "의성",
  "영덕",
  "울진",
];
const REGION_GB_WIDE = ["경북", "경상북도"];

/** 지역 토글에 따른 매칭 키워드 집합 */
export function regionKeywords(region: Region): string[] {
  switch (region) {
    case "local":
      return [...REGION_LOCAL];
    case "gb":
      return [...REGION_LOCAL, ...REGION_GB_NORTH, ...REGION_GB_WIDE];
    case "all":
      return []; // 지역 필터 없음 (식자재 필터만 적용)
  }
}

/** 식자재/급식 키워드 포함 여부 (공고명 등에 적용) */
export function hasFoodKeyword(text: string): boolean {
  return FOOD_KEYWORDS.some((k) => text.includes(k));
}

/** 지역 조건 충족 여부.
 *  ※ 지역은 반드시 수요기관명·지역제한 필드에만 적용할 것.
 *    공고명에 적용하면 "영양팀"(nutrition)이 "영양군"으로 오탐되는 등 충돌 발생. */
export function inRegion(text: string, region: Region): boolean {
  const rks = regionKeywords(region);
  if (rks.length === 0) return true;
  return rks.some((k) => text.includes(k));
}

/** 식자재 + 지역을 한 문자열에서 함께 보는 단순 버전 (fixture 필터용). */
export function matchesFilter(text: string, region: Region): boolean {
  return hasFoodKeyword(text) && inRegion(text, region);
}
