// ③④ seed (Supabase 미연결/테이블 미생성 시 읽기 전용 데모).
import type { Tx } from "../types-tx";

export const SEED_ORDERS: Tx[] = [
  {
    id: "o1", kind: "order", partyId: null, partyName: "예천중앙초등학교",
    date: "2026-06-10", deliveryDate: "2026-06-13", status: "확정",
    totalAmount: 56000 * 5 + 11000 * 8 + 20500 * 10,
    notes: "6월 2주차 급식", createdAt: "2026-06-10T01:00:00.000Z",
    items: [
      { productId: null, productName: "쌀(20kg)", unit: "20kg", qty: 5, unitPrice: 56000, amount: 280000 },
      { productId: null, productName: "배추", unit: "10kg", qty: 8, unitPrice: 11000, amount: 88000 },
      { productId: null, productName: "돼지고기(앞다리)", unit: "1kg", qty: 10, unitPrice: 20500, amount: 205000 },
    ],
  },
  {
    id: "o2", kind: "order", partyId: null, partyName: "영주시립요양원",
    date: "2026-06-11", deliveryDate: "2026-06-12", status: "납품완료",
    totalAmount: 7500 * 6 + 6200 * 8,
    notes: null, createdAt: "2026-06-11T01:00:00.000Z",
    items: [
      { productId: null, productName: "계란(특란)", unit: "30개", qty: 6, unitPrice: 7500, amount: 45000 },
      { productId: null, productName: "닭고기", unit: "1kg", qty: 8, unitPrice: 6200, amount: 49600 },
    ],
  },
];

export const SEED_PURCHASES: Tx[] = [
  {
    id: "pc1", kind: "purchase", partyId: null, partyName: "예천농협 산지유통센터",
    date: "2026-06-09", deliveryDate: null, status: "입고완료",
    totalAmount: 51000 * 5,
    notes: "예천 햅쌀", createdAt: "2026-06-09T01:00:00.000Z",
    items: [
      { productId: null, productName: "쌀(20kg)", unit: "20kg", qty: 5, unitPrice: 51000, amount: 255000 },
    ],
  },
  {
    id: "pc2", kind: "purchase", partyId: null, partyName: "경북축산물공판장",
    date: "2026-06-09", deliveryDate: null, status: "입고완료",
    totalAmount: 17000 * 10 + 4800 * 8,
    notes: null, createdAt: "2026-06-09T02:00:00.000Z",
    items: [
      { productId: null, productName: "돼지고기(앞다리)", unit: "1kg", qty: 10, unitPrice: 17000, amount: 170000 },
      { productId: null, productName: "닭고기", unit: "1kg", qty: 8, unitPrice: 4800, amount: 38400 },
    ],
  },
];
