// 나라장터 입찰공고 프록시 (키 없으면 fixture 폴백 — lib/data 에서 처리).
import { NextRequest, NextResponse } from "next/server";
import { loadBids } from "@/lib/data";
import type { Region } from "@/lib/types";

export const revalidate = 60;

function parseRegion(v: string | null): Region {
  return v === "gb" || v === "all" ? v : "local";
}

export async function GET(req: NextRequest) {
  const region = parseRegion(req.nextUrl.searchParams.get("region"));
  return NextResponse.json(await loadBids(region));
}
