// ⑤ 납품 관리 타입 — 표준표(계약) + 일일 납품 + 추적 snapshot.

/** 거래처별 표준 납품표 한 줄 */
export interface ContractLine {
  id: string;
  customerId: string | null;
  customerName: string;
  productId: string | null;
  productName: string;
  unit: string;
  stdQty: number; // 표준 수량
  salePrice: number; // 판매단가
}

/** 납품 품목 (매입가·매입처 snapshot 포함 → 추적) */
export interface DeliveryItem {
  productId: string | null;
  productName: string;
  unit: string;
  qty: number;
  salePrice: number;
  saleAmount: number; // qty*salePrice
  purchasePrice: number; // 매입단가 snapshot
  purchaseAmount: number; // qty*purchasePrice
  supplierName: string; // 매입처 snapshot
  delivered: boolean;
}

/** 일일 납품 (헤더 + 품목) */
export interface Delivery {
  id: string;
  customerId: string | null;
  customerName: string;
  date: string; // YYYY-MM-DD
  status: string;
  totalSale: number;
  totalCost: number;
  totalMargin: number;
  notes: string | null;
  items: DeliveryItem[];
  createdAt: string;
}

/** 보드 입력 한 줄 — 표준표 + 상품 원가를 합쳐 prefill */
export interface BoardRow {
  productId: string | null;
  productName: string;
  unit: string;
  stdQty: number;
  qty: number; // 실제 납품 수량(기본=stdQty)
  salePrice: number;
  purchasePrice: number; // 상품 기본 매입가
  supplierName: string; // 상품 기본 매입처
  delivered: boolean;
}

export const DELIVERY_STATUSES = ["완료", "예정", "일부", "미납"] as const;

export function deliveryTotals(items: { qty: number; salePrice: number; purchasePrice: number; delivered: boolean }[]) {
  let totalSale = 0;
  let totalCost = 0;
  for (const it of items) {
    if (!it.delivered) continue;
    totalSale += Math.round(it.qty * it.salePrice);
    totalCost += Math.round(it.qty * it.purchasePrice);
  }
  return { totalSale, totalCost, totalMargin: totalSale - totalCost };
}
