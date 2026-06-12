"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Customer } from "@/lib/types-master";
import { saveCustomer, removeCustomer } from "@/app/actions/master";
import { EntityForm, Modal, type FieldDef } from "./EntityForm";
import { DemoBadge, LiveBadge } from "@/components/ui";

const FIELDS: FieldDef[] = [
  { name: "name", label: "기관명", required: true, full: true, placeholder: "예: 예천중앙초등학교" },
  { name: "type", label: "유형", type: "select", options: ["학교", "유치원", "어린이집", "요양시설", "기관", "기타"] },
  { name: "region", label: "지역", placeholder: "경상북도 예천군" },
  { name: "contactName", label: "담당자", placeholder: "영양사 등" },
  { name: "contactPhone", label: "연락처", placeholder: "054-000-0000" },
  { name: "deliveryRoute", label: "배송 권역", placeholder: "예천 권역" },
  { name: "bizNo", label: "사업자번호" },
  { name: "address", label: "주소", full: true },
  { name: "notes", label: "비고", type: "textarea", full: true },
];

export function CustomersView({
  customers,
  usingSeed,
}: {
  customers: Customer[];
  usingSeed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function onDelete(c: Customer) {
    if (!confirm(`'${c.name}' 거래처를 삭제할까요?`)) return;
    start(async () => {
      const r = await removeCustomer(c.id);
      if (!r.ok) alert(r.error);
      else router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">거래처</h1>
          <p className="mt-1 text-sm text-slate-500">
            학교·기관 등 매출처 마스터 · 수주·정산·입찰 분석의 기준 데이터
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
            + 거래처 등록
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
              <th className="px-4 py-3">기관명</th>
              <th className="px-4 py-3">유형</th>
              <th className="px-4 py-3">지역</th>
              <th className="px-4 py-3">담당자</th>
              <th className="px-4 py-3">배송권역</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                  등록된 거래처가 없습니다.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{c.type}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.region || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.contactName || "-"}
                    {c.contactPhone && <span className="ml-1 text-xs text-slate-400">{c.contactPhone}</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.deliveryRoute || "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditing(c);
                        setOpen(true);
                      }}
                      className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => onDelete(c)}
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
        <Modal title={editing ? "거래처 수정" : "거래처 등록"} onClose={() => setOpen(false)}>
          <EntityForm
            fields={FIELDS}
            initial={editing as unknown as Record<string, unknown>}
            action={saveCustomer}
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
