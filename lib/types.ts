// 공통 도메인 타입 — 나라장터/KAMIS 응답을 정규화한 형태.

export type Region = "local" | "gb" | "all";
export type DataSource = "g2b" | "kamis" | "fixture";

/** 정규화된 입찰 공고 1건 */
export interface Bid {
  /** 공고번호 (차수 포함) */
  bidNtceNo: string;
  /** 공고명 */
  bidNtceNm: string;
  /** 수요기관명 */
  dminsttNm: string;
  /** 공고기관명 */
  ntceInsttNm: string;
  /** 공고일시 (ISO) */
  bidNtceDt: string;
  /** 입찰마감일시 (ISO) */
  bidClseDt: string;
  /** 기초금액 / 추정가격 (원). 미정이면 null */
  presmptPrce: number | null;
  /** 지역 표기 (예: "경상북도 예천군") */
  rgnNm: string;
  /** 입찰방식 (예: "제한경쟁") */
  bidMethdNm: string;
  /** 나라장터 상세 링크 */
  detailUrl: string;
  source: DataSource;
}

/** 가격 추이 한 점 */
export interface PricePoint {
  /** YYYY-MM-DD */
  date: string;
  /** 가격 (원) */
  price: number;
}

/** 정규화된 품목 가격 정보 */
export interface PriceItem {
  itemCode: string;
  itemName: string;
  /** 단위 (예: "20kg", "1kg", "10개") */
  unit: string;
  /** 부류명 (식량작물/채소류/축산물 등) */
  category: string;
  /** 최신 도매가 (원) */
  latest: number;
  /** 전월 동일 시점 가격 (원) */
  prevMonth: number;
  /** 전월 대비 등락률 (%) — 양수 상승, 음수 하락 */
  changePct: number;
  /** 추이 시계열 (오름차순) */
  series: PricePoint[];
  source: DataSource;
}

/** AI 입찰 분석 리포트 */
export interface AnalysisReport {
  /** 적합도 */
  fitness: "상" | "중" | "하";
  /** 적합도 판단 이유 */
  fitnessReason: string;
  /** 추정 식자재 단가 코멘트 */
  costComment: string;
  /** 권장 투찰가 범위 (원) */
  recommendedBidRange: {
    low: number;
    high: number;
    basis: string;
  };
  /** 주요 리스크 (최대 3개) */
  risks: string[];
  /** 한 줄 요약 */
  summary: string;
}

/** API 응답 공통 봉투 */
export interface ApiEnvelope<T> {
  data: T;
  /** fixture(데모 데이터)로 응답했는지 여부 */
  usingFixtures: boolean;
  /** 갱신 시각 (ISO) */
  fetchedAt: string;
  /** 비치명적 경고 (키 누락 등) */
  notice?: string;
}
