// ③ 수주 / ④ 매입 데이터 레이어 (통합 Tx, kind 로 분기).
// Supabase 있으면 실 DB(orders/purchases + items), 없거나 테이블 미생성 시 seed 폴백.

import { getSupabase } from "../supabase";
import { txTotal, type Tx, type TxItem, type TxKind } from "../types-tx";
import { SEED_ORDERS, SEED_PURCHASES } from "./seed-tx";

interface KindCfg {
  parent: string;
  items: string;
  partyIdCol: string;
  partyNameCol: string;
  dateCol: string;
  itemFk: string;
  hasDelivery: boolean;
}
const T: Record<TxKind, KindCfg> = {
  order: { parent: "orders", items: "order_items", partyIdCol: "customer_id", partyNameCol: "customer_name", dateCol: "order_date", itemFk: "order_id", hasDelivery: true },
  purchase: { parent: "purchases", items: "purchase_items", partyIdCol: "supplier_id", partyNameCol: "supplier_name", dateCol: "purchase_date", itemFk: "purchase_id", hasDelivery: false },
};

const seedOf = (kind: TxKind) => (kind === "order" ? SEED_ORDERS : SEED_PURCHASES);

class NoDbError extends Error {
  constructor() {
    super("Supabase 미연결/테이블 미생성 — db/schema_orders.sql 실행 후 저장됩니다.");
    this.name = "NoDbError";
  }
}

type Row = Record<string, unknown>;

function rowToTx(kind: TxKind, r: Row): Tx {
  const cfg = T[kind];
  const rawItems = (r[cfg.items] as Row[]) ?? [];
  const items: TxItem[] = rawItems.map((it) => ({
    productId: it.product_id ? String(it.product_id) : null,
    productName: String(it.product_name ?? ""),
    unit: String(it.unit ?? ""),
    qty: Number(it.qty ?? 0),
    unitPrice: Number(it.unit_price ?? 0),
    amount: Number(it.amount ?? 0),
  }));
  return {
    id: String(r.id),
    kind,
    partyId: r[cfg.partyIdCol] ? String(r[cfg.partyIdCol]) : null,
    partyName: String(r[cfg.partyNameCol] ?? ""),
    date: String(r[cfg.dateCol] ?? "").slice(0, 10),
    deliveryDate: r.delivery_date ? String(r.delivery_date).slice(0, 10) : null,
    status: String(r.status ?? ""),
    totalAmount: Number(r.total_amount ?? 0),
    notes: r.notes ? String(r.notes) : null,
    items,
    createdAt: String(r.created_at ?? ""),
  };
}

/** ③④ 테이블이 실제로 생성됐는지 (schema_orders.sql 실행 여부) */
export async function txTablesReady(): Promise<boolean> {
  const db = getSupabase();
  if (!db) return false;
  try {
    const { error } = await db.from("orders").select("id").limit(1);
    return !error; // 테이블 없으면 PGRST205 에러 → false
  } catch {
    return false;
  }
}

export async function listTx(kind: TxKind): Promise<Tx[]> {
  const db = getSupabase();
  if (!db) return seedOf(kind);
  const cfg = T[kind];
  const { data, error } = await db
    .from(cfg.parent)
    .select(`*, ${cfg.items}(*)`)
    .order("created_at", { ascending: false });
  if (error || !data) return seedOf(kind); // 테이블 미생성 등 → seed
  return (data as unknown as Row[]).map((r) => rowToTx(kind, r));
}

export interface TxInput {
  partyId: string | null;
  partyName: string;
  date: string;
  deliveryDate: string | null;
  status: string;
  notes: string | null;
  items: TxItem[];
}

export async function createTx(kind: TxKind, input: TxInput): Promise<void> {
  const db = getSupabase();
  if (!db) throw new NoDbError();
  const cfg = T[kind];
  const total = txTotal(input.items);
  const parentRow: Row = {
    [cfg.partyIdCol]: input.partyId,
    [cfg.partyNameCol]: input.partyName,
    [cfg.dateCol]: input.date,
    status: input.status,
    total_amount: total,
    notes: input.notes,
  };
  if (cfg.hasDelivery) parentRow.delivery_date = input.deliveryDate;

  const { data, error } = await db.from(cfg.parent).insert(parentRow).select("id").single();
  if (error) throw error;
  const parentId = (data as Row).id;

  const itemRows = input.items
    .filter((it) => it.productName && it.qty > 0)
    .map((it) => ({
      [cfg.itemFk]: parentId,
      product_id: it.productId,
      product_name: it.productName,
      unit: it.unit,
      qty: it.qty,
      unit_price: it.unitPrice,
      amount: it.amount,
    }));
  if (itemRows.length > 0) {
    const { error: e2 } = await db.from(cfg.items).insert(itemRows);
    if (e2) throw e2;
  }
}

export async function updateTxStatus(kind: TxKind, id: string, status: string): Promise<void> {
  const db = getSupabase();
  if (!db) throw new NoDbError();
  const { error } = await db.from(T[kind].parent).update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteTx(kind: TxKind, id: string): Promise<void> {
  const db = getSupabase();
  if (!db) throw new NoDbError();
  const { error } = await db.from(T[kind].parent).delete().eq("id", id);
  if (error) throw error;
}
