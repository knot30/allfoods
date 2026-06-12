// 대시보드 — 서버 컴포넌트. 입찰/가격 데이터를 직접 로드해 요약.
import Link from "next/link";
import { loadBids, loadPrices } from "@/lib/data";
import {
  Card,
  PageHeader,
  StatCard,
  DemoBadge,
  LiveBadge,
  DDayBadge,
} from "@/components/ui";
import { won, dDay, daysUntil, formatDate, pct } from "@/lib/format";

export const revalidate = 60;

export default async function DashboardPage() {
  const [bidsRes, pricesRes] = await Promise.all([
    loadBids("gb"),
    loadPrices(),
  ]);
  const bids = bidsRes.data;
  const prices = pricesRes.data;
  const usingFixtures = bidsRes.usingFixtures || pricesRes.usingFixtures;

  const todayNew = bids.filter((b) => daysUntil(b.bidNtceDt) === 0).length;
  const urgent = bids
    .filter((b) => {
      const d = dDay(b.bidClseDt);
      return !d.closed && d.urgent;
    })
    .sort((a, b) => a.bidClseDt.localeCompare(b.bidClseDt));
  const movers = [...prices]
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="대시보드"
        subtitle={`경북 학교급식 식자재 입찰·가격 현황 · ${formatDate(new Date().toISOString())}`}
        right={usingFixtures ? <DemoBadge notice={bidsRes.notice} /> : <LiveBadge />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="오늘 신규 공고" value={`${todayNew}건`} tone="brand" hint="최근 7일 조회 기준" />
        <StatCard label="마감 임박 (D-2)" value={`${urgent.length}건`} tone="warn" hint="2일 내 마감" />
        <StatCard label="조회된 공고" value={`${bids.length}건`} hint="경북 + 식자재 필터" />
        <StatCard label="추적 품목" value={`${prices.length}개`} hint="급식 핵심 품목 도매가" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* 마감 임박 공고 */}
        <Card className="lg:col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">마감 임박 입찰</h2>
            <Link href="/bids" className="text-xs font-medium text-accent hover:underline">
              전체 보기 →
            </Link>
          </div>
          {urgent.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">2일 내 마감 예정 공고가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {urgent.slice(0, 6).map((b) => {
                const d = dDay(b.bidClseDt);
                return (
                  <li key={b.bidNtceNo} className="flex items-center gap-3 py-3">
                    <DDayBadge {...d} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-800">{b.bidNtceNm}</div>
                      <div className="truncate text-xs text-slate-400">{b.dminsttNm} · {b.rgnNm}</div>
                    </div>
                    <div className="shrink-0 text-right text-sm font-semibold tabular text-slate-700">
                      {won(b.presmptPrce)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* 주요 품목 등락 */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">주요 품목 등락</h2>
            <Link href="/prices" className="text-xs font-medium text-accent hover:underline">
              추이 →
            </Link>
          </div>
          <ul className="space-y-3">
            {movers.map((p) => {
              const up = p.changePct > 0;
              return (
                <li key={p.itemCode} className="flex items-center justify-between">
                  <div className="text-sm text-slate-700">
                    {p.itemName}
                    <span className="ml-1 text-xs text-slate-400">/{p.unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium tabular text-slate-600">
                      {p.latest.toLocaleString()}원
                    </span>
                    <span
                      className={`w-14 text-right text-xs font-semibold tabular ${
                        up ? "text-rose-600" : p.changePct < 0 ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      {pct(p.changePct)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        나라장터(조달청) · KAMIS(농산물유통정보) 연동 · AI 입찰 분석 프로토타입
      </p>
    </div>
  );
}
