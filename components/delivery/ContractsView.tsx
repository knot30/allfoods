"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types-master";
import type { ContractLine } from "@/lib/types-delivery";
import { saveContractAction } from "@/app/actions/delivery";
import { DemoBadge, LiveBadge, Card } from "@/components/ui";

interface Party {
  id: string;
  name: string;
}
interface Line {
  productId: string | null;
  productName: string;
  unit: string;
  stdQty: number;
  salePrice: number;
}

export function ContractsView({
  customers,
  products,
  contracts,
  usingSeed,
}: {
  customers: Party[];
  products: Product[];
  contracts: ContractLine[];
  usingSeed: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [customerName, setCustomerName] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [error, setError] = useState<string | null>(null);

  function pickCustomer(name: string) {
    setCustomerName(name);
    setError(null);
    const existing = contracts
      .filter((c) => c.customerName === name)
      .map((c) => ({ productId: c.productId, productName: c.productName, unit: c.unit, stdQty: c.stdQty, salePrice: c.salePrice }));
    setLines(existing.length ? existing : [{ productId: null, productName: "", unit: "", stdQty: 1, salePrice: 0 }]);
  }
  function setLine(i: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function pickProduct(i: number, id: string) {
    const p = products.find((x) => x.id === id);
    if (!p) return setLine(i, { productId: null, productName: "", unit: "" });
    setLine(i, { productId: p.id, productName: p.name, unit: p.unit, salePrice: p.salePrice ?? 0 });
  }

  function save() {
    setError(null);
    const party = customers.find((c) => c.name === customerName);
    start(async () => {
      const res = await saveContractAction(
        party?.id ?? null,
        customerName,
        lines.filter((l) => l.productName && l.stdQty > 0).map((l) => ({
          productId: l.productId, productName: l.productName, unit: l.unit, stdQty: l.stdQty, salePrice: l.salePrice,
        })),
      );
      if (res.ok) router.refresh();
      else setError(res.error ?? "저장 실패");
    });
  }

  const customersWithContract = new Set(contracts.map((c) => c.customerName));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">납품 표준표</h1>
          <p className="mt-1 text-sm text-slate-500">
            거래처별 표준 납품 품목·수량·판매단가. 납품 보드에서 매일 이 표가 자동으로 떠요.
          </p>
        </div>
        {usingSeed ? <DemoBadge notice="테이블 미생성 — 예시" /> : <LiveBadge />}
      </div>

      <Card className="p-5">
        <label className="block max-w-xs">
          <span className="mb-1 block text-xs font-medium text-slate-500">거래처</span>
          <select value={customerName} onChange={(e) => pickCustomer(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">거래처 선택</option>
            {customers.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}{customersWithContract.has(c.name) ? " ✓" : ""}
              </option>
            ))}
          </select>
        </label>

        {customerName && (
          <div className="mt-5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">표준 납품 품목</span>
              <button onClick={() => setLines((ls) => [...ls, { productId: null, productName: "", unit: "", stdQty: 1, salePrice: 0 }])}
                className="text-xs font-medium text-accent hover:underline">+ 품목 추가</button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <select value={l.productId ?? ""} onChange={(e) => pickProduct(i, e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand">
                    <option value="">상품 선택</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" min={0} value={l.stdQty} title="표준수량"
                    onChange={(e) => setLine(i, { stdQty: Number(e.target.value) })}
                    className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm outline-none focus:border-brand" />
                  <input type="number" min={0} value={l.salePrice} title="판매단가"
                    onChange={(e) => setLine(i, { salePrice: Number(e.target.value) })}
                    className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm outline-none focus:border-brand" />
                  <button onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, idx) => idx !== i) : ls))}
                    className="shrink-0 rounded px-1.5 py-1 text-slate-400 hover:bg-slate-100 hover:text-rose-500">✕</button>
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-slate-400">
              <span>상품 · 표준수량 · 판매단가</span>
            </div>

            {error && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">{error}</p>}

            <div className="mt-4 flex justify-end">
              <button onClick={save} disabled={pending || usingSeed}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
                {pending ? "저장 중…" : "표준표 저장"}
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
