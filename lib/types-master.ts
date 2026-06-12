// ② 마스터 데이터 도메인 타입.
// 향후 ③수주·④매입·⑥정산·입찰이력이 이 엔티티들을 FK 로 참조하며,
// 그 집계가 ① AI 입찰 분석으로 되먹임된다(우리 원가·마진·낙찰률).

/** 거래처(매출처) — 학교/기관 등 수요처 */
export interface Customer {
  id: string;
  name: string; // 기관명
  type: CustomerType;
  region: string; // 예: 경상북도 예천군
  bizNo: string | null; // 사업자등록번호
  contactName: string | null; // 담당자(영양사 등)
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  deliveryRoute: string | null; // 배송 권역/동선 (⑤ 물류 연결)
  notes: string | null;
  createdAt: string;
}

export type CustomerType = "학교" | "유치원" | "어린이집" | "요양시설" | "기관" | "기타";

/** 공급처(매입처) — 산지/도매시장/생산자 */
export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  region: string;
  bizNo: string | null;
  contactName: string | null;
  contactPhone: string | null;
  notes: string | null;
  createdAt: string;
}

export type SupplierType = "산지" | "도매시장" | "생산자" | "벤더" | "기타";

/** 상품(식자재) */
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unit: string; // 20kg, 1kg, 특란 30개
  origin: string | null; // 원산지 (⑦ 규정)
  spec: string | null; // 규격
  isEco: boolean; // 친환경 여부
  cert: string | null; // 인증 (HACCP/무농약/유기농 등)
  /** KAMIS item_code — ① 가격추적과 연결되는 핵심 키 */
  kamisItemCode: string | null;
  purchasePrice: number | null; // 매입 단가(원) — ① 권장투찰가의 원가 기준
  salePrice: number | null; // 판매 단가(원)
  /** 기본 매입처 — 납품 줄에 매입처 snapshot 으로 자동 적용 (⑤ 추적) */
  defaultSupplierName: string | null;
  notes: string | null;
  createdAt: string;
}

export type ProductCategory =
  | "식량작물"
  | "채소류"
  | "축산물"
  | "수산물"
  | "과일류"
  | "가공식품"
  | "기타";

/** 서버 액션 결과 (폼 표시용) */
export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** 마진율(%) — 판매/매입 단가가 모두 있을 때 */
export function marginPct(p: Product): number | null {
  if (!p.purchasePrice || !p.salePrice || p.purchasePrice <= 0) return null;
  return Math.round(((p.salePrice - p.purchasePrice) / p.purchasePrice) * 1000) / 10;
}
