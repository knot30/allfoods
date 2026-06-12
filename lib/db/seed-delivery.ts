// ⑤ 납품 seed (테이블 미생성 시 읽기 전용 데모).
import type { ContractLine, Delivery } from "../types-delivery";

export const SEED_CONTRACTS: ContractLine[] = [
  // 예천중앙초등학교 표준 납품표
  { id: "ct1", customerId: null, customerName: "예천중앙초등학교", productId: null, productName: "쌀(20kg)", unit: "20kg", stdQty: 2, salePrice: 56000 },
  { id: "ct2", customerId: null, customerName: "예천중앙초등학교", productId: null, productName: "배추", unit: "10kg", stdQty: 3, salePrice: 11000 },
  { id: "ct3", customerId: null, customerName: "예천중앙초등학교", productId: null, productName: "돼지고기(앞다리)", unit: "1kg", stdQty: 5, salePrice: 20500 },
  { id: "ct4", customerId: null, customerName: "예천중앙초등학교", productId: null, productName: "계란(특란)", unit: "30개", stdQty: 4, salePrice: 7500 },
  // 영주시립요양원 표준 납품표
  { id: "ct5", customerId: null, customerName: "영주시립요양원", productId: null, productName: "쌀(20kg)", unit: "20kg", stdQty: 1, salePrice: 56000 },
  { id: "ct6", customerId: null, customerName: "영주시립요양원", productId: null, productName: "무", unit: "20kg", stdQty: 2, salePrice: 16000 },
  { id: "ct7", customerId: null, customerName: "영주시립요양원", productId: null, productName: "닭고기", unit: "1kg", stdQty: 6, salePrice: 6200 },
  { id: "ct8", customerId: null, customerName: "영주시립요양원", productId: null, productName: "대파", unit: "1kg", stdQty: 3, salePrice: 3200 },
];

export const SEED_DELIVERIES: Delivery[] = [
  {
    id: "d1", customerId: null, customerName: "예천중앙초등학교", date: "2026-06-12",
    status: "완료",
    totalSale: 2 * 56000 + 3 * 11000 + 5 * 20500 + 4 * 7500,
    totalCost: 2 * 51000 + 3 * 9000 + 5 * 17000 + 4 * 6000,
    totalMargin: 0, notes: null, createdAt: "2026-06-12T00:30:00.000Z",
    items: [
      { productId: null, productName: "쌀(20kg)", unit: "20kg", qty: 2, salePrice: 56000, saleAmount: 112000, purchasePrice: 51000, purchaseAmount: 102000, supplierName: "예천농협 산지유통센터", delivered: true },
      { productId: null, productName: "배추", unit: "10kg", qty: 3, salePrice: 11000, saleAmount: 33000, purchasePrice: 9000, purchaseAmount: 27000, supplierName: "예천친환경영농조합", delivered: true },
      { productId: null, productName: "돼지고기(앞다리)", unit: "1kg", qty: 5, salePrice: 20500, saleAmount: 102500, purchasePrice: 17000, purchaseAmount: 85000, supplierName: "경북축산물공판장", delivered: true },
      { productId: null, productName: "계란(특란)", unit: "30개", qty: 4, salePrice: 7500, saleAmount: 30000, purchasePrice: 6000, purchaseAmount: 24000, supplierName: "경북축산물공판장", delivered: true },
    ],
  },
];
// 마진 보정
SEED_DELIVERIES.forEach((d) => (d.totalMargin = d.totalSale - d.totalCost));
