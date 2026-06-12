// 일회성: seed 데이터를 Supabase 에 삽입 (테이블이 비어있을 때만).
// 실행: node scripts/seed-db.mjs   (.env.local 의 SUPABASE_* 를 env 로 전달)
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const customers = [
  { name: "예천중앙초등학교", type: "학교", region: "경상북도 예천군", contact_name: "김영양", contact_phone: "054-650-0000", address: "예천군 예천읍", delivery_route: "예천 권역", notes: "주 3회 납품" },
  { name: "영주여자고등학교", type: "학교", region: "경상북도 영주시", contact_name: "박영양", contact_phone: "054-630-0000", address: "영주시 휴천동", delivery_route: "영주 권역" },
  { name: "예천군육아종합지원센터", type: "기관", region: "경상북도 예천군", contact_name: "이담당", contact_phone: "054-650-1111", address: "예천군 예천읍", delivery_route: "예천 권역", notes: "어린이집 연합 부식" },
  { name: "영주시립요양원", type: "요양시설", region: "경상북도 영주시", contact_name: "최담당", contact_phone: "054-630-2222", address: "영주시 가흥동", delivery_route: "영주 권역", notes: "매일 식자재 납품" },
];

const suppliers = [
  { name: "예천농협 산지유통센터", type: "산지", region: "경상북도 예천군", contact_phone: "054-650-3333", notes: "쌀·잡곡" },
  { name: "안동농수산물도매시장", type: "도매시장", region: "경상북도 안동시", contact_phone: "054-840-0000", notes: "채소·과일" },
  { name: "경북축산물공판장", type: "벤더", region: "경상북도", notes: "축산물" },
  { name: "예천친환경영농조합", type: "생산자", region: "경상북도 예천군", notes: "친환경 채소" },
];

const products = [
  { name: "쌀(20kg)", category: "식량작물", unit: "20kg", origin: "국산(예천)", spec: "1등급", is_eco: false, kamis_item_code: "111", purchase_price: 51000, sale_price: 56000 },
  { name: "배추", category: "채소류", unit: "10kg", origin: "국산", is_eco: true, cert: "무농약", kamis_item_code: "211", purchase_price: 9000, sale_price: 11000 },
  { name: "무", category: "채소류", unit: "20kg", origin: "국산", is_eco: false, kamis_item_code: "231", purchase_price: 13500, sale_price: 16000 },
  { name: "양파", category: "채소류", unit: "15kg", origin: "국산", is_eco: false, kamis_item_code: "245", purchase_price: 15500, sale_price: 18500 },
  { name: "감자", category: "식량작물", unit: "20kg", origin: "국산", is_eco: false, kamis_item_code: "152", purchase_price: 35000, sale_price: 40000 },
  { name: "돼지고기(앞다리)", category: "축산물", unit: "1kg", origin: "국산", spec: "냉장", is_eco: false, cert: "HACCP", kamis_item_code: "514", purchase_price: 17000, sale_price: 20500 },
  { name: "닭고기", category: "축산물", unit: "1kg", origin: "국산", spec: "냉장", is_eco: false, cert: "HACCP", kamis_item_code: "515", purchase_price: 4800, sale_price: 6200 },
  { name: "계란(특란)", category: "축산물", unit: "30개", origin: "국산", is_eco: false, cert: "HACCP", kamis_item_code: "901", purchase_price: 6000, sale_price: 7500 },
  { name: "대파", category: "채소류", unit: "1kg", origin: "국산", is_eco: true, cert: "무농약", kamis_item_code: "246", purchase_price: 2400, sale_price: 3200 },
];

async function seed(table, rows) {
  const { count, error: cErr } = await db.from(table).select("*", { count: "exact", head: true });
  if (cErr) throw cErr;
  if ((count ?? 0) > 0) {
    console.log(`- ${table}: 이미 ${count}건 존재 → 건너뜀`);
    return;
  }
  const { error } = await db.from(table).insert(rows);
  if (error) throw error;
  console.log(`- ${table}: ${rows.length}건 삽입 ✓`);
}

try {
  await seed("customers", customers);
  await seed("suppliers", suppliers);
  await seed("products", products);
  console.log("seed 완료");
} catch (e) {
  console.error("실패:", e.message ?? e);
  process.exit(1);
}
