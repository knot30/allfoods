// AI 분석 리포트 표시 (입찰 화면 드로어 + 분석 화면 공용).
import type { AnalysisReport, Bid } from "@/lib/types";
import { won, wonFull, formatDateTime } from "@/lib/format";

const FIT_TONE: Record<AnalysisReport["fitness"], string> = {
  상: "bg-emerald-100 text-emerald-700 border-emerald-200",
  중: "bg-amber-100 text-amber-700 border-amber-200",
  하: "bg-rose-100 text-rose-700 border-rose-200",
};

export function AnalysisCard({
  bid,
  report,
  usingFixtures,
}: {
  bid: Bid;
  report: AnalysisReport;
  usingFixtures: boolean;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs text-slate-400">{bid.dminsttNm} · {bid.rgnNm}</div>
        <h3 className="mt-0.5 text-base font-semibold leading-snug text-slate-900">
          {bid.bidNtceNm}
        </h3>
        <div className="mt-1 text-xs text-slate-500">
          기초금액 {won(bid.presmptPrce)} · 마감 {formatDateTime(bid.bidClseDt)}
        </div>
      </div>

      {/* 적합도 */}
      <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-lg font-bold ${FIT_TONE[report.fitness]}`}
        >
          {report.fitness}
        </span>
        <div>
          <div className="text-xs font-semibold text-slate-500">적합도</div>
          <p className="mt-0.5 text-sm leading-relaxed text-slate-700">
            {report.fitnessReason}
          </p>
        </div>
      </div>

      {/* 권장 투찰가 */}
      <div className="rounded-lg border border-brand/15 bg-brand/5 p-4">
        <div className="text-xs font-semibold text-brand">권장 투찰가 범위</div>
        <div className="mt-1 text-xl font-bold tabular text-brand">
          {wonFull(report.recommendedBidRange.low)}
          <span className="mx-2 text-slate-400">~</span>
          {wonFull(report.recommendedBidRange.high)}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {report.recommendedBidRange.basis}
        </p>
      </div>

      {/* 단가 코멘트 */}
      <div>
        <div className="text-xs font-semibold text-slate-500">추정 식자재 단가 코멘트</div>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{report.costComment}</p>
      </div>

      {/* 리스크 */}
      <div>
        <div className="text-xs font-semibold text-slate-500">주요 리스크</div>
        <ul className="mt-1.5 space-y-1.5">
          {report.risks.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700">
              <span className="mt-0.5 text-rose-400">▲</span>
              <span className="leading-relaxed">{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 요약 */}
      <div className="rounded-lg bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
        {report.summary}
      </div>

      {usingFixtures && (
        <p className="text-[11px] text-amber-600">
          ※ AI 키 미설정 상태의 데모 분석입니다. ANTHROPIC_API_KEY 연결 시 실제 분석으로 대체됩니다.
        </p>
      )}
    </div>
  );
}
