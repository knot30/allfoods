// AI 입찰 분석 — 선택 공고 + 관련 KAMIS 가격을 묶어 구조화 리포트 생성.
// AI SDK v6 generateObject + Zod 스키마로 파싱 안전성 확보.

import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { ANALYZE_MODEL } from "./config";
import type { AnalysisReport, Bid, PriceItem } from "./types";

const reportSchema = z.object({
  fitness: z.enum(["상", "중", "하"]).describe("이 공고가 우리(예천·영주 연고 급식 식자재 납품사)에게 맞는 정도"),
  fitnessReason: z.string().describe("적합도 판단 근거 2~3문장"),
  costComment: z.string().describe("관련 품목 도매가 동향을 반영한 추정 식자재 단가 코멘트"),
  recommendedBidRange: z.object({
    low: z.number().describe("권장 투찰 하한가(원)"),
    high: z.number().describe("권장 투찰 상한가(원)"),
    basis: z.string().describe("권장 범위 산정 근거"),
  }),
  risks: z.array(z.string()).max(3).describe("주요 리스크 최대 3개"),
  summary: z.string().describe("한 줄 요약"),
});

function priceContext(prices: PriceItem[]): string {
  if (prices.length === 0) return "관련 품목 가격 데이터 없음";
  return prices
    .map(
      (p) =>
        `- ${p.itemName}(${p.unit}): 도매 ${p.latest.toLocaleString()}원, 전월대비 ${p.changePct > 0 ? "+" : ""}${p.changePct}%`,
    )
    .join("\n");
}

function selectModel() {
  // ANTHROPIC_API_KEY 직접 호출 우선. 없고 AI_GATEWAY_API_KEY 만 있으면
  // ANALYZE_MODEL 을 게이트웨이 모델 문자열('anthropic/claude-...')로 두고 bare string 전달.
  if (!process.env.ANTHROPIC_API_KEY && process.env.AI_GATEWAY_API_KEY) {
    return ANALYZE_MODEL;
  }
  return anthropic(ANALYZE_MODEL);
}

export async function analyzeBid(
  bid: Bid,
  prices: PriceItem[],
): Promise<AnalysisReport> {
  const system = [
    "당신은 학교급식 식자재 조달 입찰 전문가입니다.",
    "발주처는 경북 예천·영주 연고의 식자재 납품 회사입니다.",
    "주어진 공고와 도매가 동향을 근거로 보수적이고 실무적인 분석을 제공하세요.",
    "추정·권장값은 반드시 제시된 기초금액과 가격 동향에 근거를 두고 산정하세요.",
  ].join(" ");

  const prompt = [
    "[입찰 공고]",
    `공고명: ${bid.bidNtceNm}`,
    `수요기관: ${bid.dminsttNm}`,
    `지역: ${bid.rgnNm || "미상"}`,
    `입찰방식: ${bid.bidMethdNm || "미상"}`,
    `기초금액: ${bid.presmptPrce ? bid.presmptPrce.toLocaleString() + "원" : "미공개"}`,
    `마감: ${bid.bidClseDt || "미상"}`,
    "",
    "[관련 품목 도매가 동향 (KAMIS)]",
    priceContext(prices),
  ].join("\n");

  const { object } = await generateObject({
    model: selectModel() as never,
    schema: reportSchema,
    system,
    prompt,
  });

  return object;
}
