// KAMIS 농산물유통정보 OpenAPI 클라이언트.
// 일별 품목별 도·소매가격(dailyPriceByCategoryList) + 기간별(periodProductList).
// 서버에서만 호출 (인증키 노출/CORS 방지).

import { KAMIS_BASE_URL, KAMIS_CERT_KEY, KAMIS_CERT_ID } from "./config";
import type { PriceItem, PricePoint } from "./types";

/** 급식 핵심 품목 카탈로그.
 *  item_category_code(부류) / item_code(품목) / kind_code(품종) 는 KAMIS 명세표 기준이며
 *  TODO: 키 발급 후 명세표(부류·품목·품종 코드표)로 최종 검증할 것. 도매(02) 기준. */
export interface MealItem {
  itemCode: string; // KAMIS item_code
  categoryCode: string; // KAMIS item_category_code (부류)
  kindCode: string; // KAMIS kind_code (품종) — 비우면 대표 품종
  name: string;
  category: string; // 부류명 (표시용)
  unit: string; // 표시 단위
  /** fixture 생성용 기준 도매가 (원) */
  basePrice: number;
}

export const MEAL_ITEMS: MealItem[] = [
  { itemCode: "111", categoryCode: "100", kindCode: "01", name: "쌀(20kg)", category: "식량작물", unit: "20kg", basePrice: 54000 },
  { itemCode: "152", categoryCode: "100", kindCode: "01", name: "감자", category: "식량작물", unit: "20kg", basePrice: 38000 },
  { itemCode: "211", categoryCode: "200", kindCode: "01", name: "배추", category: "채소류", unit: "10kg", basePrice: 9800 },
  { itemCode: "231", categoryCode: "200", kindCode: "01", name: "무", category: "채소류", unit: "20kg", basePrice: 14500 },
  { itemCode: "245", categoryCode: "200", kindCode: "00", name: "양파", category: "채소류", unit: "15kg", basePrice: 16800 },
  { itemCode: "246", categoryCode: "200", kindCode: "00", name: "대파", category: "채소류", unit: "1kg", basePrice: 2600 },
  { itemCode: "514", categoryCode: "500", kindCode: "00", name: "돼지고기", category: "축산물", unit: "1kg", basePrice: 18900 },
  { itemCode: "515", categoryCode: "500", kindCode: "00", name: "닭고기", category: "축산물", unit: "1kg", basePrice: 5400 },
  { itemCode: "901", categoryCode: "500", kindCode: "00", name: "계란", category: "축산물", unit: "특란 30개", basePrice: 6700 },
];

export const findMealItem = (code: string) =>
  MEAL_ITEMS.find((i) => i.itemCode === code);

function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface KamisRow {
  itemname?: string;
  price?: string;
  regday?: string;
  yyyy?: string;
}

/** 기간별 가격(periodProductList) 호출 → 시계열 반환. 빈 응답/에러는 [] */
async function fetchSeries(
  item: MealItem,
  start: Date,
  end: Date,
): Promise<PricePoint[]> {
  const params = new URLSearchParams({
    action: "periodProductList",
    p_productclicklist: "02", // 도매
    p_startday: fmtDate(start),
    p_endday: fmtDate(end),
    p_itemcategorycode: item.categoryCode,
    p_itemcode: item.itemCode,
    p_kindcode: item.kindCode,
    p_productrankcode: "04",
    p_convert_kg_yn: "N",
    p_cert_key: KAMIS_CERT_KEY,
    p_cert_id: KAMIS_CERT_ID,
    p_returntype: "json",
  });

  const res = await fetch(`${KAMIS_BASE_URL}?${params.toString()}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];

  const json: unknown = await res.json().catch(() => null);
  // KAMIS 응답 구조: { data: { item: [ { regday, price, ... } ] } } (변동 가능)
  const rows = extractRows(json);
  return rows
    .map((r) => {
      const price = Number(String(r.price ?? "").replace(/[^0-9.-]/g, ""));
      const date = normalizeKamisDate(r);
      if (!date || !Number.isFinite(price) || price <= 0) return null;
      return { date, price } satisfies PricePoint;
    })
    .filter((p): p is PricePoint => p !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function extractRows(json: unknown): KamisRow[] {
  if (!json || typeof json !== "object") return [];
  const data = (json as Record<string, unknown>).data;
  if (Array.isArray(data)) return data as KamisRow[];
  if (data && typeof data === "object") {
    const item = (data as Record<string, unknown>).item;
    if (Array.isArray(item)) return item as KamisRow[];
  }
  return [];
}

function normalizeKamisDate(r: KamisRow): string | null {
  // periodProductList 는 보통 yyyy + regday("MM/DD") 분리 제공
  if (r.regday && /\d{2}\/\d{2}/.test(r.regday)) {
    const [mm, dd] = r.regday.split("/");
    const yyyy = r.yyyy ?? String(new Date().getFullYear());
    return `${yyyy}-${mm}-${dd}`;
  }
  if (r.regday && /\d{4}-\d{2}-\d{2}/.test(r.regday)) return r.regday;
  return null;
}

function changePct(latest: number, prev: number): number {
  if (!prev) return 0;
  return Math.round(((latest - prev) / prev) * 1000) / 10;
}

/** 카탈로그 전 품목에 대해 30일 시계열 + 전월 대비 등락을 조회. */
export async function getPrices(): Promise<PriceItem[]> {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  const prevAnchor = new Date(end);
  prevAnchor.setMonth(prevAnchor.getMonth() - 1);

  const results = await Promise.all(
    MEAL_ITEMS.map(async (item) => {
      const series = await fetchSeries(item, start, end);
      if (series.length === 0) return null;
      const latest = series[series.length - 1].price;
      // 전월 시점에 가장 가까운 점
      const prevStr = fmtDate(prevAnchor);
      const prev =
        [...series]
          .reverse()
          .find((p) => p.date <= prevStr)?.price ?? series[0].price;
      return {
        itemCode: item.itemCode,
        itemName: item.name,
        unit: item.unit,
        category: item.category,
        latest,
        prevMonth: prev,
        changePct: changePct(latest, prev),
        series,
        source: "kamis" as const,
      } satisfies PriceItem;
    }),
  );

  return results.flatMap((r) => (r ? [r] : []));
}
