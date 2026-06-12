// AI 입찰 분석 프록시 (키 없으면 fixture 폴백 — lib/data 에서 처리).
import { NextRequest, NextResponse } from "next/server";
import { loadAnalysis } from "@/lib/data";
import type { Bid } from "@/lib/types";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let bid: Bid;
  try {
    const body = await req.json();
    bid = body.bid as Bid;
    if (!bid?.bidNtceNm) throw new Error("bid 누락");
  } catch {
    return NextResponse.json({ error: "잘못된 요청: bid 필요" }, { status: 400 });
  }
  return NextResponse.json(await loadAnalysis(bid));
}
