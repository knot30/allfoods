"use client";

import { useState } from "react";
import type { AnalysisReport, ApiEnvelope, Bid, Region } from "@/lib/types";
import { won, dDay, formatDateTime } from "@/lib/format";
import { DemoBadge, LiveBadge, DDayBadge } from "@/components/ui";
import { AnalysisCard } from "@/components/AnalysisCard";

const REGIONS: { value: Region; label: string }[] = [
  { value: "local", label: "예천·영주" },
  { value: "gb", label: "경북 북부" },
  { value: "all", label: "전체" },
];

export function BidsView({
  initial,
  initialRegion,
}: {
  initial: ApiEnvelope<Bid[]>;
  initialRegion: Region;
}) {
  const [region, setRegion] = useState<Region>(initialRegion);
  const [res, setRes] = useState<ApiEnvelope<Bid[]>>(initial);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState<Bid | null>(null);
  const [report, setReport] = useState<ApiEnvelope<AnalysisReport> | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function changeRegion(next: Region) {
    if (next === region) return;
    setRegion(next);
    setLoading(true);
    try {
      const r = await fetch(`/api/bids?region=${next}`, { cache: "no-store" });
      setRes(await r.json());
    } finally {
      setLoading(false);
    }
  }

  async function analyze(bid: Bid) {
    setSelected(bid);
    setReport(null);
    setAnalyzing(true);
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bid }),
      });
      setReport(await r.json());
    } catch {
      setReport(null);
    } finally {
      setAnalyzing(false);
    }
  }

  const bids = res.data;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">입찰 공고</h1>
          <p className="mt-1 text-sm text-slate-500">
            나라장터 물품 공고 · 식자재/급식 키워드 필터 · 최근 7일
          </p>
        </div>
        <div className="flex items-center gap-3">
          {res.usingFixtures ? <DemoBadge notice={res.notice} /> : <LiveBadge />}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
            {REGIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => changeRegion(r.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  region === r.value
                    ? "bg-brand text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
              <th className="px-4 py-3">마감</th>
              <th className="px-4 py-3">공고명 / 수요기관</th>
              <th className="px-4 py-3 text-right">기초금액</th>
              <th className="px-4 py-3">방식</th>
              <th className="px-4 py-3 text-right">분석</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  불러오는 중…
                </td>
              </tr>
            ) : bids.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  조건에 맞는 공고가 없습니다.
                </td>
              </tr>
            ) : (
              bids.map((b) => {
                const d = dDay(b.bidClseDt);
                return (
                  <tr key={b.bidNtceNo} className="hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-4 py-3">
                      <DDayBadge {...d} />
                      <div className="mt-1 text-[11px] text-slate-400">
                        {formatDateTime(b.bidClseDt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{b.bidNtceNm}</div>
                      <div className="text-xs text-slate-400">
                        {b.dminsttNm} · {b.rgnNm}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular text-slate-700">
                      {won(b.presmptPrce)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {b.bidMethdNm || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => analyze(b)}
                        className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
                      >
                        AI 분석
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {res.usingFixtures
          ? "데모 데이터 표시 중 — G2B_SERVICE_KEY 연결 시 실시간 공고로 전환됩니다."
          : `실시간 · ${bids.length}건`}
      </p>

      {/* 분석 드로어 */}
      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 h-full w-full max-w-md overflow-y-auto bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-3 backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                <span>✦</span> AI 입찰 분석
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              {analyzing || !report ? (
                <div className="space-y-3 py-10 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
                  <p className="text-sm text-slate-500">공고와 도매가를 분석하는 중…</p>
                </div>
              ) : (
                <AnalysisCard
                  bid={selected}
                  report={report.data}
                  usingFixtures={report.usingFixtures}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
