// ② 마스터 seed 데이터. Supabase 미연결 시 읽기 전용 데모로 사용.
// 실제 사업 기반(예천·영주, 학교급식 식자재) 기준의 현실적 샘플.

import type { Customer, Product, Supplier } from "../types-master";

export const SEED_CUSTOMERS: Customer[] = [
  { id: "c1", name: "예천중앙초등학교", type: "학교", region: "경상북도 예천군", bizNo: null, contactName: "김영양", contactPhone: "054-650-0000", contactEmail: null, address: "예천군 예천읍", deliveryRoute: "예천 권역", notes: "주 3회 납품", createdAt: "2026-03-02T00:00:00.000Z" },
  { id: "c2", name: "영주여자고등학교", type: "학교", region: "경상북도 영주시", bizNo: null, contactName: "박영양", contactPhone: "054-630-0000", contactEmail: null, address: "영주시 휴천동", deliveryRoute: "영주 권역", notes: null, createdAt: "2026-03-02T00:00:00.000Z" },
  { id: "c3", name: "예천군육아종합지원센터", type: "기관", region: "경상북도 예천군", bizNo: null, contactName: "이담당", contactPhone: "054-650-1111", contactEmail: null, address: "예천군 예천읍", deliveryRoute: "예천 권역", notes: "어린이집 연합 부식", createdAt: "2026-03-10T00:00:00.000Z" },
  { id: "c4", name: "영주시립요양원", type: "요양시설", region: "경상북도 영주시", bizNo: null, contactName: "최담당", contactPhone: "054-630-2222", contactEmail: null, address: "영주시 가흥동", deliveryRoute: "영주 권역", notes: "매일 식자재 납품", createdAt: "2026-04-01T00:00:00.000Z" },
];

export const SEED_SUPPLIERS: Supplier[] = [
  { id: "s1", name: "예천농협 산지유통센터", type: "산지", region: "경상북도 예천군", bizNo: null, contactName: null, contactPhone: "054-650-3333", notes: "쌀·잡곡", createdAt: "2026-03-01T00:00:00.000Z" },
  { id: "s2", name: "안동농수산물도매시장", type: "도매시장", region: "경상북도 안동시", bizNo: null, contactName: null, contactPhone: "054-840-0000", notes: "채소·과일", createdAt: "2026-03-01T00:00:00.000Z" },
  { id: "s3", name: "경북축산물공판장", type: "벤더", region: "경상북도", bizNo: null, contactName: null, contactPhone: null, notes: "축산물", createdAt: "2026-03-05T00:00:00.000Z" },
  { id: "s4", name: "예천친환경영농조합", type: "생산자", region: "경상북도 예천군", bizNo: null, contactName: null, contactPhone: null, notes: "친환경 채소", createdAt: "2026-03-08T00:00:00.000Z" },
];

export const SEED_PRODUCTS: Product[] = [
  { id: "p1", name: "쌀(20kg)", category: "식량작물", unit: "20kg", origin: "국산(예천)", spec: "1등급", isEco: false, cert: null, kamisItemCode: "111", purchasePrice: 51000, salePrice: 56000, notes: null, createdAt: "2026-03-02T00:00:00.000Z" },
  { id: "p2", name: "배추", category: "채소류", unit: "10kg", origin: "국산", spec: null, isEco: true, cert: "무농약", kamisItemCode: "211", purchasePrice: 9000, salePrice: 11000, notes: null, createdAt: "2026-03-02T00:00:00.000Z" },
  { id: "p3", name: "무", category: "채소류", unit: "20kg", origin: "국산", spec: null, isEco: false, cert: null, kamisItemCode: "231", purchasePrice: 13500, salePrice: 16000, notes: null, createdAt: "2026-03-02T00:00:00.000Z" },
  { id: "p4", name: "양파", category: "채소류", unit: "15kg", origin: "국산", spec: null, isEco: false, cert: null, kamisItemCode: "245", purchasePrice: 15500, salePrice: 18500, notes: null, createdAt: "2026-03-02T00:00:00.000Z" },
  { id: "p5", name: "감자", category: "식량작물", unit: "20kg", origin: "국산", spec: null, isEco: false, cert: null, kamisItemCode: "152", purchasePrice: 35000, salePrice: 40000, notes: null, createdAt: "2026-03-02T00:00:00.000Z" },
  { id: "p6", name: "돼지고기(앞다리)", category: "축산물", unit: "1kg", origin: "국산", spec: "냉장", isEco: false, cert: "HACCP", kamisItemCode: "514", purchasePrice: 17000, salePrice: 20500, notes: null, createdAt: "2026-03-05T00:00:00.000Z" },
  { id: "p7", name: "닭고기", category: "축산물", unit: "1kg", origin: "국산", spec: "냉장", isEco: false, cert: "HACCP", kamisItemCode: "515", purchasePrice: 4800, salePrice: 6200, notes: null, createdAt: "2026-03-05T00:00:00.000Z" },
  { id: "p8", name: "계란(특란)", category: "축산물", unit: "30개", origin: "국산", spec: null, isEco: false, cert: "HACCP", kamisItemCode: "901", purchasePrice: 6000, salePrice: 7500, notes: null, createdAt: "2026-03-05T00:00:00.000Z" },
  { id: "p9", name: "대파", category: "채소류", unit: "1kg", origin: "국산", spec: null, isEco: true, cert: "무농약", kamisItemCode: "246", purchasePrice: 2400, salePrice: 3200, notes: null, createdAt: "2026-03-08T00:00:00.000Z" },
];
