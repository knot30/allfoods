// ⑤ 납품 데이터 레이어 — 표준표(계약) + 일일 납품. Supabase 없거나 테이블 미생성 시 seed 폴백.
import { getSupabase } from "../supabase";
import {
  deliveryTotals,
  type ContractLine,
  type Delivery,
  type DeliveryItem,
} from "../types-delivery";
import { SEED_CONTRACTS, SEED_DELIVERIES } from "./seed-delivery";

type Row = Record<string, unknown>;

class NoDbError extends Error {
  constructor() {
    super("Supabase 미연결/테이블 미생성 — db/schema_delivery.sql 실행 후 저장됩니다.");
    this.name = "NoDbError";
  }
}

export async function deliveryTablesReady(): Promise<boolean> {
  const db = getSupabase();
  if (!db) return false;
  try {
    const { error } = await db.from("delivery_contracts").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}

// ── 표준표(계약) ────────────────────────────────────────────────
function rowToContract(r: Row): ContractLine {
  return {
    id: String(r.id),
    customerId: r.customer_id ? String(r.customer_id) : null,
    customerName: String(r.customer_name ?? ""),
    productId: r.product_id ? String(r.product_id) : null,
    productName: String(r.product_name ?? ""),
    unit: String(r.unit ?? ""),
    stdQty: Number(r.std_qty ?? 0),
    salePrice: Number(r.sale_price ?? 0),
  };
}

export async function listContracts(): Promise<ContractLine[]> {
  const db = getSupabase();
  if (!db) return SEED_CONTRACTS;
  const { data, error } = await db.from("delivery_contracts").select("*").order("created_at");
  if (error || !data) return SEED_CONTRACTS;
  return (data as Row[]).map(rowToContract);
}

/** 한 거래처의 표준표를 통째로 교체(삭제 후 삽입) */
export async function replaceContract(
  customerId: string | null,
  customerName: string,
  lines: Omit<ContractLine, "id" | "customerId" | "customerName">[],
): Promise<void> {
  const db = getSupabase();
  if (!db) throw new NoDbError();
  const del = customerId
    ? await db.from("delivery_contracts").delete().eq("customer_id", customerId)
    : await db.from("delivery_contracts").delete().eq("customer_name", customerName);
  if (del.error) throw del.error;
  const rows = lines
    .filter((l) => l.productName && l.stdQty > 0)
    .map((l) => ({
      customer_id: customerId,
      customer_name: customerName,
      product_id: l.productId,
      product_name: l.productName,
      unit: l.unit,
      std_qty: l.stdQty,
      sale_price: l.salePrice,
    }));
  if (rows.length > 0) {
    const { error } = await db.from("delivery_contracts").insert(rows);
    if (error) throw error;
  }
}

// ── 일일 납품 ───────────────────────────────────────────────────
function rowToDelivery(r: Row): Delivery {
  const rawItems = (r.delivery_items as Row[]) ?? [];
  const items: DeliveryItem[] = rawItems.map((it) => ({
    productId: it.product_id ? String(it.product_id) : null,
    productName: String(it.product_name ?? ""),
    unit: String(it.unit ?? ""),
    qty: Number(it.qty ?? 0),
    salePrice: Number(it.sale_price ?? 0),
    saleAmount: Number(it.sale_amount ?? 0),
    purchasePrice: Number(it.purchase_price ?? 0),
    purchaseAmount: Number(it.purchase_amount ?? 0),
    supplierName: String(it.supplier_name ?? ""),
    delivered: Boolean(it.delivered),
  }));
  return {
    id: String(r.id),
    customerId: r.customer_id ? String(r.customer_id) : null,
    customerName: String(r.customer_name ?? ""),
    date: String(r.delivery_date ?? "").slice(0, 10),
    status: String(r.status ?? ""),
    totalSale: Number(r.total_sale ?? 0),
    totalCost: Number(r.total_cost ?? 0),
    totalMargin: Number(r.total_margin ?? 0),
    notes: r.notes ? String(r.notes) : null,
    items,
    createdAt: String(r.created_at ?? ""),
  };
}

export async function listDeliveries(): Promise<Delivery[]> {
  const db = getSupabase();
  if (!db) return SEED_DELIVERIES;
  const { data, error } = await db
    .from("deliveries")
    .select("*, delivery_items(*)")
    .order("delivery_date", { ascending: false })
    .limit(100);
  if (error || !data) return SEED_DELIVERIES;
  return (data as unknown as Row[]).map(rowToDelivery);
}

export interface DeliveryInput {
  customerId: string | null;
  customerName: string;
  date: string;
  status: string;
  notes: string | null;
  items: DeliveryItem[];
}

export async function createDelivery(input: DeliveryInput): Promise<void> {
  const db = getSupabase();
  if (!db) throw new NoDbError();
  const delivered = input.items.filter((it) => it.delivered && it.productName && it.qty > 0);
  const totals = deliveryTotals(delivered);
  const { data, error } = await db
    .from("deliveries")
    .insert({
      customer_id: input.customerId,
      customer_name: input.customerName,
      delivery_date: input.date,
      status: input.status,
      total_sale: totals.totalSale,
      total_cost: totals.totalCost,
      total_margin: totals.totalMargin,
      notes: input.notes,
    })
    .select("id")
    .single();
  if (error) throw error;
  const deliveryId = (data as unknown as Row).id;

  const itemRows = delivered.map((it) => ({
    delivery_id: deliveryId,
    product_id: it.productId,
    product_name: it.productName,
    unit: it.unit,
    qty: it.qty,
    sale_price: it.salePrice,
    sale_amount: Math.round(it.qty * it.salePrice),
    purchase_price: it.purchasePrice,
    purchase_amount: Math.round(it.qty * it.purchasePrice),
    supplier_name: it.supplierName,
    delivered: true,
  }));
  if (itemRows.length > 0) {
    const { error: e2 } = await db.from("delivery_items").insert(itemRows);
    if (e2) throw e2;
  }
}

export async function deleteDelivery(id: string): Promise<void> {
  const db = getSupabase();
  if (!db) throw new NoDbError();
  const { error } = await db.from("deliveries").delete().eq("id", id);
  if (error) throw error;
}
