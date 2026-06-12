"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TX_META, type Tx, type TxItem, type TxKind } from "@/lib/types-tx";
import type { Product } from "@/lib/types-master";
import { createTxAction, deleteTxAction, updateStatusAction } from "@/app/actions/tx";
import { Modal } from "@/components/master/EntityForm";
import { DemoBadge, LiveBadge } from "@/components/ui";

interface Party {
  id: string;
  name: string;
}
interface Row {
  productId: string | null;
  productName: string;
  unit: string;
  qty: number;
  unitPrice: number;
}

const won = (n: number) => `${n.toLocaleString()}원`;
const today = () => new Date().toISOString().slice(0, 10);

export function TxView({
  kind,
  list,
  parties,
  products,
  usingSeed,
}: {
  kind: TxKind;
  list: Tx[];
  parties: Party[];
  products: Product[];
  usingSeed: boolean;
}) {
  const meta = TX_META[kind];
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{meta.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {kind === "order"
              ? "거래처(학교·기관) 발주 접수 → 납품 일정·금액 관리"
              : "공급처(산지·도매) 발주·입고 → 실매입원가 기록 (AI 분석 원가로 연결)"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {usingSeed ? <DemoBadge notice="테이블 미생성 — 예시 데이터" /> : <LiveBadge />}
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            + {meta.title} 등록
          </button>
        </div>
      </div>

      {usingSeed && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          저장하려면 Supabase SQL Editor 에서 <code>db/schema_orders.sql</code> 을 실행하세요. 지금은 예시 데이터입니다.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
              <th className="px-4 py-3">{meta.dateLabel}</th>
              <th className="px-4 py-3">{meta.party}</th>
              <th className="px-4 py-3">품목</th>
              <th className="px-4 py-3 text-right">합계</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                  등록된 {meta.title} 내역이 없습니다.
                </td>
              </tr>
            ) : (
              list.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {t.date}
                    {t.deliveryDate && (
                      <div className="text-[11px] text-slate-400">납품 {t.deliveryDate}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{t.partyName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.items[0]?.productName}
                    {t.items.length > 1 && (
                      <span className="text-slate-400"> 외 {t.items.length - 1}건</span>
                    )}
                    <div className="text-[11px] text-slate-400">
                      {t.items.reduce((s, it) => s + it.qty, 0)}개 품목수량
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular text-slate-800">
                    {won(t.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={t.status}
                      disabled={pending || usingSeed}
                      onChange={(e) =>
                        start(async () => {
                          const r = await updateStatusAction(kind, t.id, e.target.value);
                          if (!r.ok) alert(r.error);
                          else router.refresh();
                        })
                      }
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 disabled:opacity-60"
                    >
                      {meta.statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (!confirm(`이 ${meta.title} 내역을 삭제할까요?`)) return;
                        start(async () => {
                          const r = await deleteTxAction(kind, t.id);
                          if (!r.ok) alert(r.error);
                          else router.refresh();
                        });
                      }}
                      disabled={pending || usingSeed}
                      className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={`${meta.title} 등록`} onClose={() => setOpen(false)}>
          <TxForm
            kind={kind}
            parties={parties}
            products={products}
            onDone={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function TxForm({
  kind,
  parties,
  products,
  onDone,
}: {
  kind: TxKind;
  parties: Party[];
  products: Product[];
  onDone: () => void;
}) {
  const meta = TX_META[kind];
  const [partyName, setPartyName] = useState("");
  const [date, setDate] = useState(today());
  const [deliveryDate, setDeliveryDate] = useState("");
  const [status, setStatus] = useState(meta.statuses[0]);
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<Row[]>([
    { productId: null, productName: "", unit: "", qty: 1, unitPrice: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const total = useMemo(
    () => rows.reduce((s, r) => s + Math.round(r.qty * r.unitPrice), 0),
    [rows],
  );

  function setRow(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function pickProduct(i: number, productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) {
      setRow(i, { productId: null, productName: "", unit: "" });
      return;
    }
    const price = kind === "order" ? p.salePrice : p.purchasePrice;
    setRow(i, {
      productId: p.id,
      productName: p.name,
      unit: p.unit,
      unitPrice: price ?? 0,
    });
  }

  function submit() {
    setError(null);
    const party = parties.find((p) => p.name === partyName) ?? null;
    const items: TxItem[] = rows
      .filter((r) => r.productName && r.qty > 0)
      .map((r) => ({
        productId: r.productId,
        productName: r.productName,
        unit: r.unit,
        qty: r.qty,
        unitPrice: r.unitPrice,
        amount: Math.round(r.qty * r.unitPrice),
      }));
    start(async () => {
      const res = await createTxAction(kind, {
        partyId: party?.id ?? null,
        partyName,
        date,
        deliveryDate: kind === "order" && deliveryDate ? deliveryDate : null,
        status,
        notes: notes || null,
        items,
      });
      if (res.ok) onDone();
      else setError(res.error ?? "저장 실패");
    });
  }

  const input = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2">
          <span className="mb-1 block text-xs font-medium text-slate-500">{meta.party} *</span>
          <input
            list="party-list"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            placeholder={`${meta.party} 선택 또는 입력`}
            className={input}
          />
          <datalist id="party-list">
            {parties.map((p) => (
              <option key={p.id} value={p.name} />
            ))}
          </datalist>
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium text-slate-500">{meta.dateLabel}</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
        </label>
        {kind === "order" ? (
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-500">납품예정일</span>
            <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className={input} />
          </label>
        ) : (
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-500">상태</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={input}>
              {meta.statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* 품목 라인 */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">품목</span>
          <button
            onClick={() => setRows((rs) => [...rs, { productId: null, productName: "", unit: "", qty: 1, unitPrice: 0 }])}
            className="text-xs font-medium text-accent hover:underline"
          >
            + 품목 추가
          </button>
        </div>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <select
                value={r.productId ?? ""}
                onChange={(e) => pickProduct(i, e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand"
              >
                <option value="">상품 선택</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={r.qty}
                min={0}
                onChange={(e) => setRow(i, { qty: Number(e.target.value) })}
                className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm outline-none focus:border-brand"
                title="수량"
              />
              <input
                type="number"
                value={r.unitPrice}
                min={0}
                onChange={(e) => setRow(i, { unitPrice: Number(e.target.value) })}
                className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm outline-none focus:border-brand"
                title={meta.priceLabel}
              />
              <span className="w-24 shrink-0 text-right text-sm tabular text-slate-600">
                {won(Math.round(r.qty * r.unitPrice))}
              </span>
              <button
                onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs))}
                className="shrink-0 rounded px-1.5 py-1 text-slate-400 hover:bg-slate-100 hover:text-rose-500"
                title="삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-2 text-sm">
          <span className="text-slate-500">합계</span>
          <span className="text-lg font-bold tabular text-brand">{won(total)}</span>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500">비고</span>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className={input} />
      </label>

      {error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">{error}</p>}

      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "저장 중…" : "저장"}
        </button>
      </div>
    </div>
  );
}
