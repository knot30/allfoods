// KAMIS 가격 프록시 (키 없으면 fixture 폴백 — lib/data 에서 처리).
import { NextResponse } from "next/server";
import { loadPrices } from "@/lib/data";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json(await loadPrices());
}
