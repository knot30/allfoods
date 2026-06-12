"use client";

import { useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ApiEnvelope, PriceItem } from "@/lib/types";
import { pct } from "@/lib/format";
import { Card, DemoBadge, LiveBadge } from "@/components/ui";

export function PricesView({ res }: { res: ApiEnvelope<PriceItem[]> }) {
  const items = res.data;
  const [selectedCode, setSelectedCode] = useState(items[0]?.itemCode ?? "");
  const selected = items.find((i) => i.itemCode === selectedCode) ?? items[0];

  const chartData = selected?.series.map((p) => ({
    date: p.date.slice(5), // MM-DD
    price: p.price,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">가격 추적</h1>
          <p className="mt-1 text-sm text-slate-500">
            KAMIS 농산물 도매가 · 급식 핵심 품목 · 최근 30일 / 전월 대비
          </p>
        </div>
        {res.usingFixtures ? <DemoBadge notice={res.notice} /> : <LiveBadge />}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 품목 선택 */}
        <Card className="p-2 lg:col-span-1">
          <ul className="max-h-[460px] overflow-y-auto">
            {items.map((it) => {
              const active = it.itemCode === selectedCode;
              const up = it.changePct > 0;
              return (
                <li key={it.itemCode}>
                  <button
                    onClick={() => setSelectedCode(it.itemCode)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      active ? "bg-brand/10" : "hover:bg-slate-50"
                    }`}
                  >
                    <span>
                      <span className={`font-medium ${active ? "text-brand" : "text-slate-800"}`}>
                        {it.itemName}
                      </span>
                      <span className="ml-1 text-xs text-slate-400">/{it.unit}</span>
                    </span>
                    <span
                      className={`text-xs font-semibold tabular ${
                        up ? "text-rose-600" : it.changePct < 0 ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      {pct(it.changePct)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* 차트 */}
        <Card className="p-5 lg:col-span-2">
          {selected && (
            <>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <div className="text-sm text-slate-500">
                    {selected.category} · {selected.itemName} ({selected.unit})
                  </div>
                  <div className="mt-1 text-2xl font-bold tabular text-slate-900">
                    {selected.latest.toLocaleString()}원
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">전월 대비</div>
                  <div
                    className={`text-lg font-bold tabular ${
                      selected.changePct > 0
                        ? "text-rose-600"
                        : selected.changePct < 0
                          ? "text-blue-600"
                          : "text-slate-400"
                    }`}
                  >
                    {pct(selected.changePct)}
                  </div>
                  <div className="text-[11px] text-slate-400 tabular">
                    {selected.prevMonth.toLocaleString()} → {selected.latest.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      interval="preserveStartEnd"
                      minTickGap={28}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      width={56}
                      tickFormatter={(v) => `${(v / 1000).toLocaleString()}k`}
                      axisLine={false}
                      tickLine={false}
                      domain={["dataMin - 200", "dataMax + 200"]}
                    />
                    <Tooltip
                      formatter={(v) => [`${Number(v).toLocaleString()}원`, "도매가"]}
                      labelFormatter={(l) => `${l}`}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#14315e"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Card>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {res.usingFixtures
          ? "데모 데이터 표시 중 — KAMIS_CERT_KEY/ID 연결 시 실시간 도매가로 전환됩니다."
          : "실시간 · KAMIS periodProductList"}
      </p>
    </div>
  );
}
