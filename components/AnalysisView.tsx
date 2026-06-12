"use client";

import { useState } from "react";
import type { AnalysisReport, ApiEnvelope, Bid } from "@/lib/types";
import { won, dDay, formatDateTime } from "@/lib/format";
import { Card, DemoBadge, LiveBadge, DDayBadge } from "@/components/ui";
import { AnalysisCard } from "@/components/AnalysisCard";

export function AnalysisView({ bidsRes }: { bidsRes: ApiEnvelope<Bid[]> }) {
  const bids = bidsRes.data;
  const [selected, setSelected] = useState<Bid | null>(null);
  const [report, setReport] = useState<ApiEnvelope<AnalysisReport> | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function run(bid: Bid) {
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

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI 입찰 분석</h1>
          <p className="mt-1 text-sm text-slate-500">
            공고를 선택하면 도매가 동향과 엮어 적합도·권장 투찰가·리스크를 자동 분석합니다.
          </p>
        </div>
        {bidsRes.usingFixtures ? <DemoBadge notice={bidsRes.notice} /> : <LiveBadge />}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* 공고 선택 */}
        <Card className="p-2 lg:col-span-2">
          <ul className="max-h-[560px] overflow-y-auto">
            {bids.map((b) => {
              const active = selected?.bidNtceNo === b.bidNtceNo;
              const d = dDay(b.bidClseDt);
              return (
                <li key={b.bidNtceNo}>
                  <button
                    onClick={() => run(b)}
                    className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${
                      active ? "bg-brand/10" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-medium ${active ? "text-brand" : "text-slate-800"}`}>
                        {b.bidNtceNm}
                      </span>
                      <DDayBadge {...d} />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                      <span>{b.dminsttNm}</span>
                      <span className="tabular">{won(b.presmptPrce)}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* 리포트 */}
        <Card className="p-6 lg:col-span-3">
          {!selected ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
              <div className="text-3xl text-slate-300">✦</div>
              <p className="mt-3 text-sm text-slate-400">
                왼쪽에서 공고를 선택하면 AI 분석 리포트가 생성됩니다.
              </p>
            </div>
          ) : analyzing || !report ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 text-center">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
              <p className="text-sm text-slate-500">공고와 도매가를 분석하는 중…</p>
              <p className="text-xs text-slate-400">{selected.bidNtceNm}</p>
            </div>
          ) : (
            <AnalysisCard
              bid={selected}
              report={report.data}
              usingFixtures={report.usingFixtures}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
