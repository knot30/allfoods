"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Supplier } from "@/lib/types-master";
import { saveSupplier, removeSupplier } from "@/app/actions/master";
import { EntityForm, Modal, type FieldDef } from "./EntityForm";
import { DemoBadge, LiveBadge } from "@/components/ui";

const FIELDS: FieldDef[] = [
  { name: "name", label: "공급처명", required: true, full: true, placeholder: "예: 예천농협 산지유통센터" },
  { name: "type", label: "유형", type: "select", options: ["산지", "도매시장", "생산자", "벤더", "기타"] },
  { name: "region", label: "지역", placeholder: "경상북도 예천군" },
  { name: "contactName", label: "담당자" },
  { name: "contactPhone", label: "연락처", placeholder: "054-000-0000" },
  { name: "bizNo", label: "사업자번호" },
  { name: "notes", label: "비고 (취급품목 등)", type: "textarea", full: true },
];

export function SuppliersView({
  suppliers,
  usingSeed,
}: {
  suppliers: Supplier[];
  usingSeed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function onDelete(srow: Supplier) {
    if (!confirm(`'${srow.name}' 공급처를 삭제할까요?`)) return;
    start(async () => {
      const r = await removeSupplier(srow.id);
      if (!r.ok) alert(r.error);
      else router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">공급처</h1>
          <p className="mt-1 text-sm text-slate-500">
            산지·도매시장·생산자 등 매입처 마스터 · 매입·원가 분석의 기준
          </p>
        </div>
        <div className="flex items-center gap-3">
          {usingSeed ? <DemoBadge notice="Supabase 미연결 — 예시 데이터" /> : <LiveBadge />}
          <button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            + 공급처 등록
          </button>
        </div>
      </div>

      {usingSeed && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Supabase 연결 전이라 예시 데이터입니다. 저장·삭제는 DB 연결 후 동작합니다.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
              <th className="px-4 py-3">공급처명</th>
              <th className="px-4 py-3">유형</th>
              <th className="px-4 py-3">지역</th>
              <th className="px-4 py-3">연락처</th>
              <th className="px-4 py-3">비고</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                  등록된 공급처가 없습니다.
                </td>
              </tr>
            ) : (
              suppliers.map((sp) => (
                <tr key={sp.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-800">{sp.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{sp.type}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{sp.region || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{sp.contactPhone || "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{sp.notes || "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditing(sp);
                        setOpen(true);
                      }}
                      className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => onDelete(sp)}
                      disabled={pending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
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
        <Modal title={editing ? "공급처 수정" : "공급처 등록"} onClose={() => setOpen(false)}>
          <EntityForm
            fields={FIELDS}
            initial={editing as unknown as Record<string, unknown>}
            action={saveSupplier}
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
