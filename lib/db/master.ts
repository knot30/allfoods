// ② 마스터 데이터 접근 레이어. Supabase 있으면 실 DB, 없으면 seed(읽기 전용).
// 서버 전용 (service role).

import { getSupabase, hasSupabase } from "../supabase";
import type { Customer, Product, Supplier } from "../types-master";
import { SEED_CUSTOMERS, SEED_PRODUCTS, SEED_SUPPLIERS } from "./seed";

export { hasSupabase };

class NoDbError extends Error {
  constructor() {
    super("Supabase 미연결 — 저장하려면 SUPABASE_URL/SERVICE_ROLE_KEY 설정이 필요합니다.");
    this.name = "NoDbError";
  }
}

// ── row(snake) ↔ type(camel) 매핑 ──────────────────────────────
type Row = Record<string, unknown>;
const s = (v: unknown) => (v == null ? null : String(v));
const n = (v: unknown) => (v == null || v === "" ? null : Number(v));

function rowToCustomer(r: Row): Customer {
  return {
    id: String(r.id), name: String(r.name), type: (r.type as Customer["type"]) ?? "기타",
    region: String(r.region ?? ""), bizNo: s(r.biz_no), contactName: s(r.contact_name),
    contactPhone: s(r.contact_phone), contactEmail: s(r.contact_email), address: s(r.address),
    deliveryRoute: s(r.delivery_route), notes: s(r.notes), createdAt: String(r.created_at),
  };
}
function customerToRow(c: Partial<Customer>): Row {
  return {
    name: c.name, type: c.type, region: c.region, biz_no: c.bizNo, contact_name: c.contactName,
    contact_phone: c.contactPhone, contact_email: c.contactEmail, address: c.address,
    delivery_route: c.deliveryRoute, notes: c.notes,
  };
}

function rowToSupplier(r: Row): Supplier {
  return {
    id: String(r.id), name: String(r.name), type: (r.type as Supplier["type"]) ?? "기타",
    region: String(r.region ?? ""), bizNo: s(r.biz_no), contactName: s(r.contact_name),
    contactPhone: s(r.contact_phone), notes: s(r.notes), createdAt: String(r.created_at),
  };
}
function supplierToRow(c: Partial<Supplier>): Row {
  return {
    name: c.name, type: c.type, region: c.region, biz_no: c.bizNo,
    contact_name: c.contactName, contact_phone: c.contactPhone, notes: c.notes,
  };
}

function rowToProduct(r: Row): Product {
  return {
    id: String(r.id), name: String(r.name), category: (r.category as Product["category"]) ?? "기타",
    unit: String(r.unit ?? ""), origin: s(r.origin), spec: s(r.spec), isEco: Boolean(r.is_eco),
    cert: s(r.cert), kamisItemCode: s(r.kamis_item_code), purchasePrice: n(r.purchase_price),
    salePrice: n(r.sale_price), notes: s(r.notes), createdAt: String(r.created_at),
  };
}
function productToRow(c: Partial<Product>): Row {
  return {
    name: c.name, category: c.category, unit: c.unit, origin: c.origin, spec: c.spec,
    is_eco: c.isEco, cert: c.cert, kamis_item_code: c.kamisItemCode,
    purchase_price: c.purchasePrice, sale_price: c.salePrice, notes: c.notes,
  };
}

// ── 거래처 ─────────────────────────────────────────────────────
export async function listCustomers(): Promise<Customer[]> {
  const db = getSupabase();
  if (!db) return SEED_CUSTOMERS;
  const { data, error } = await db.from("customers").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToCustomer);
}
export async function upsertCustomer(input: Partial<Customer> & { id?: string }): Promise<void> {
  const db = getSupabase();
  if (!db) throw new NoDbError();
  const row = customerToRow(input);
  const res = input.id
    ? await db.from("customers").update(row).eq("id", input.id)
    : await db.from("customers").insert(row);
  if (res.error) throw res.error;
}
export async function deleteCustomer(id: string): Promise<void> {
  const db = getSupabase();
  if (!db) throw new NoDbError();
  const { error } = await db.from("customers").delete().eq("id", id);
  if (error) throw error;
}

// ── 공급처 ─────────────────────────────────────────────────────
export async function listSuppliers(): Promise<Supplier[]> {
  const db = getSupabase();
  if (!db) return SEED_SUPPLIERS;
  const { data, error } = await db.from("suppliers").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToSupplier);
}
export async function upsertSupplier(input: Partial<Supplier> & { id?: string }): Promise<void> {
  const db = getSupabase();
  if (!db) throw new NoDbError();
  const row = supplierToRow(input);
  const res = input.id
    ? await db.from("suppliers").update(row).eq("id", input.id)
    : await db.from("suppliers").insert(row);
  if (res.error) throw res.error;
}
export async function deleteSupplier(id: string): Promise<void> {
  const db = getSupabase();
  if (!db) throw new NoDbError();
  const { error } = await db.from("suppliers").delete().eq("id", id);
  if (error) throw error;
}

// ── 상품 ───────────────────────────────────────────────────────
export async function listProducts(): Promise<Product[]> {
  const db = getSupabase();
  if (!db) return SEED_PRODUCTS;
  const { data, error } = await db.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}
export async function upsertProduct(input: Partial<Product> & { id?: string }): Promise<void> {
  const db = getSupabase();
  if (!db) throw new NoDbError();
  const row = productToRow(input);
  const res = input.id
    ? await db.from("products").update(row).eq("id", input.id)
    : await db.from("products").insert(row);
  if (res.error) throw res.error;
}
export async function deleteProduct(id: string): Promise<void> {
  const db = getSupabase();
  if (!db) throw new NoDbError();
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) throw error;
}
