// ③ 수주 / ④ 매입 — 구조가 동일하여 통합 Tx 모델로 관리(kind 로 구분).

export type TxKind = "order" | "purchase";

/** 거래 품목 라인 */
export interface TxItem {
  productId: string | null;
  productName: string;
  unit: string;
  qty: number;
  unitPrice: number; // 수주=판매단가 / 매입=매입단가
  amount: number; // qty * unitPrice
}

/** 거래 문서 (수주 또는 매입) */
export interface Tx {
  id: string;
  kind: TxKind;
  partyId: string | null; // customer_id(수주) / supplier_id(매입)
  partyName: string; // 스냅샷
  date: string; // YYYY-MM-DD (order_date / purchase_date)
  deliveryDate: string | null; // 수주 납품예정일
  status: string;
  totalAmount: number;
  notes: string | null;
  items: TxItem[];
  createdAt: string;
}

/** kind 별 표시·옵션 메타 */
export const TX_META: Record<
  TxKind,
  {
    title: string;
    party: string; // 거래처/공급처
    dateLabel: string;
    statuses: string[];
    priceLabel: string; // 판매단가/매입단가
  }
> = {
  order: {
    title: "수주",
    party: "거래처",
    dateLabel: "수주일",
    statuses: ["접수", "확정", "납품완료", "취소"],
    priceLabel: "판매단가",
  },
  purchase: {
    title: "매입",
    party: "공급처",
    dateLabel: "매입일",
    statuses: ["발주", "입고완료", "취소"],
    priceLabel: "매입단가",
  },
};

export function txTotal(items: TxItem[]): number {
  return items.reduce((s, it) => s + (it.amount || 0), 0);
}
