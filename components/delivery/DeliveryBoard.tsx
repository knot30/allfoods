"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types-master";
import {
  deliveryTotals,
  type BoardRow,
  type ContractLine,
  type Delivery,
} from "@/lib/types-delivery";
import { createDeliveryAction, deleteDeliveryAction } from "@/app/actions/delivery";
import { DemoBadge, LiveBadge, Card } from "@/components/ui";

interface Party {
  id: string;
  name: string;
}
const won = (n: number) => `${n.toLocaleString()}원`;
const today = () => new Date().toISOString().slice(0, 10);

export function DeliveryBoard({
  customers,
  products,
  contracts,
  deliveries,
  usingSeed,
}: {
  customers: Party[];
  products: Product[];
  contracts: ContractLine[];
  deliveries: Delivery[];
  usingSeed: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [date, setDate] = useState(today());
  const [customerName, setCustomerName] = useState("");
  const [rows, setRows] = useState<BoardRow[]>([]);

  function buildRows(name: string): BoardRow[] {
    return contracts
      .filter((c) => c.customerName === name)
      .map((c) => {
        const p = products.find((x) => x.name === c.productName);
        return {
          productId: c.productId ?? p?.id ?? null,
          productName: c.productName,
          unit: c.unit || p?.unit || "",
          stdQty: c.stdQty,
          qty: c.stdQty,
          salePrice: c.salePrice,
          purchasePrice: p?.purchasePrice ?? 0,
          supplierName: p?.defaultSupplierName ?? "",
          delivered: true,
        };
      });
  }

  function pickCustomer(name: string) {
    setCustomerName(name);
    setRows(buildRows(name));
  }
  function setRow(i: number, patch: Partial<BoardRow>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  const totals = useMemo(() => deliveryTotals(rows), [rows]);

  function save() {
    const party = customers.find((c) => c.name === customerName);
    start(async () => {
      const res = await createDeliveryAction({
        customerId: party?.id ?? null,
        customerName,
        date,
        status: rows.every((r) => r.delivered) ? "완료" : "일부",
        notes: null,
        items: rows.map((r) => ({
          productId: r.productId,
          productName: r.productName,
          unit: r.unit,
          qty: r.qty,
          salePrice: r.salePrice,
          saleAmount: Math.round(r.qty * r.salePrice),
          purchasePrice: r.purchasePrice,
          purchaseAmount: Math.round(r.qty * r.purchasePrice),
          supplierName: r.supplierName,
          delivered: r.delivered,
        })),
      });
      if (res.ok) {
        setCustomerName("");
        setRows([]);
        router.refresh();
      } else alert(res.error);
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">납품 보드</h1>
          <p className="mt-1 text-sm text-slate-500">
            날짜·거래처 선택 → 표준 납품표가 자동으로 떠요. 근태처럼 체크하고 저장하면 매출·매입·마진이 기록됩니다.
          </p>
        </div>
        {usingSeed ? <DemoBadge notice="테이블 미생성 — 예시 데이터" /> : <LiveBadge />}
      </div>

      {usingSeed && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          저장하려면 Supabase SQL Editor 에서 <code>db/schema_delivery.sql</code> 을 실행하세요. 지금은 예시입니다.
        </p>
      )}

      {/* 입력 보드 */}
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-500">납품일</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
          </label>
          <label className="min-w-[200px]">
            <span className="mb-1 block text-xs font-medium text-slate-500">거래처</span>
            <select value={customerName} onChange={(e) => pickCustomer(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand">
              <option value="">거래처 선택</option>
              {customers.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>

        {!customerName ? (
          <p className="py-10 text-center text-sm text-slate-400">거래처를 선택하면 표준 납품표가 표시됩니다.</p>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            이 거래처의 표준 납품표가 없습니다. <a href="/contracts" className="text-accent underline">표준표 등록</a> 후 사용하세요.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
                    <th className="py-2 pr-2">납품</th>
                    <th className="py-2 pr-2">품목</th>
                    <th className="py-2 pr-2 text-right">표준</th>
                    <th className="py-2 pr-2 text-right">납품수량</th>
                    <th className="py-2 pr-2 text-right">판매가</th>
                    <th className="py-2 pr-2 text-right">매입가</th>
                    <th className="py-2 pr-2">매입처</th>
                    <th className="py-2 pr-2 text-right">매출</th>
                    <th className="py-2 text-right">마진</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r, i) => {
                    const sale = Math.round(r.qty * r.salePrice);
                    const margin = Math.round(r.qty * (r.salePrice - r.purchasePrice));
                    return (
                      <tr key={i} className={r.delivered ? "" : "opacity-40"}>
                        <td className="py-2 pr-2">
                          <input type="checkbox" checked={r.delivered}
                            onChange={(e) => setRow(i, { delivered: e.target.checked })}
                            className="h-4 w-4 accent-brand" />
                        </td>
                        <td className="py-2 pr-2 font-medium text-slate-800">
                          {r.productName}<span className="ml-1 text-xs text-slate-400">/{r.unit}</span>
                        </td>
                        <td className="py-2 pr-2 text-right text-slate-400 tabular">{r.stdQty}</td>
                        <td className="py-2 pr-2 text-right">
                          <input type="number" min={0} value={r.qty}
                            onChange={(e) => setRow(i, { qty: Number(e.target.value) })}
                            className="w-16 rounded border border-slate-200 px-1.5 py-1 text-right text-sm outline-none focus:border-brand" />
                        </td>
                        <td className="py-2 pr-2 text-right tabular text-slate-600">{r.salePrice.toLocaleString()}</td>
                        <td className="py-2 pr-2 text-right tabular text-slate-400">{r.purchasePrice.toLocaleString()}</td>
                        <td className="py-2 pr-2 text-xs text-slate-500">{r.supplierName || "-"}</td>
                        <td className="py-2 pr-2 text-right tabular font-medium text-slate-700">{sale.toLocaleString()}</td>
                        <td className="py-2 text-right tabular font-semibold text-emerald-600">{margin.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 pt-3 text-sm">
              <span className="text-slate-500">매출 <b className="tabular text-slate-800">{won(totals.totalSale)}</b></span>
              <span className="text-slate-500">매입 <b className="tabular text-slate-600">{won(totals.totalCost)}</b></span>
              <span className="text-slate-500">마진 <b className="tabular text-emerald-600">{won(totals.totalMargin)}</b></span>
              <button onClick={save} disabled={pending || usingSeed}
                className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
                {pending ? "저장 중…" : "납품 저장"}
              </button>
            </div>
          </>
        )}
      </Card>

      {/* 최근 납품 내역 */}
      <h2 className="mb-3 mt-8 text-base font-semibold text-slate-900">최근 납품 내역</h2>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
              <th className="px-4 py-3">납품일</th>
              <th className="px-4 py-3">거래처</th>
              <th className="px-4 py-3">품목</th>
              <th className="px-4 py-3 text-right">매출</th>
              <th className="px-4 py-3 text-right">매입</th>
              <th className="px-4 py-3 text-right">마진</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deliveries.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-sm text-slate-400">납품 내역이 없습니다.</td></tr>
            ) : (
              deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{d.date}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{d.customerName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {d.items[0]?.productName}{d.items.length > 1 && <span className="text-slate-400"> 외 {d.items.length - 1}건</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular text-slate-700">{won(d.totalSale)}</td>
                  <td className="px-4 py-3 text-right tabular text-slate-500">{won(d.totalCost)}</td>
                  <td className="px-4 py-3 text-right tabular font-semibold text-emerald-600">{won(d.totalMargin)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{d.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (!confirm("이 납품 내역을 삭제할까요?")) return;
                        start(async () => {
                          const r = await deleteDeliveryAction(d.id);
                          if (!r.ok) alert(r.error); else router.refresh();
                        });
                      }}
                      disabled={pending || usingSeed}
                      className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40">
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
