"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { marginPct, type Product } from "@/lib/types-master";
import { saveProduct, removeProduct } from "@/app/actions/master";
import { EntityForm, Modal, type FieldDef } from "./EntityForm";
import { DemoBadge, LiveBadge } from "@/components/ui";

const FIELDS: FieldDef[] = [
  { name: "name", label: "상품명", required: true, full: true, placeholder: "예: 쌀(20kg)" },
  { name: "category", label: "분류", type: "select", options: ["식량작물", "채소류", "축산물", "수산물", "과일류", "가공식품", "기타"] },
  { name: "unit", label: "단위", placeholder: "20kg / 1kg / 30개" },
  { name: "kamisItemCode", label: "KAMIS 품목코드", placeholder: "111", hint: "① 가격추적과 연동" },
  { name: "purchasePrice", label: "매입단가(원)", type: "number", hint: "① 원가·납품 매입가 기준" },
  { name: "salePrice", label: "판매단가(원)", type: "number" },
  { name: "defaultSupplierName", label: "기본 매입처", placeholder: "예: 예천농협 산지유통센터", hint: "납품 추적용", full: true },
  { name: "origin", label: "원산지", placeholder: "국산(예천)" },
  { name: "cert", label: "인증", placeholder: "HACCP / 무농약 / 유기농" },
  { name: "spec", label: "규격" },
  { name: "isEco", label: "친환경", type: "checkbox", hint: "친환경 식자재" },
  { name: "notes", label: "비고", type: "textarea", full: true },
];

function priceText(v: number | null) {
  return v == null ? "-" : `${v.toLocaleString()}원`;
}

export function ProductsView({
  products,
  usingSeed,
}: {
  products: Product[];
  usingSeed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function onDelete(p: Product) {
    if (!confirm(`'${p.name}' 상품을 삭제할까요?`)) return;
    start(async () => {
      const r = await removeProduct(p.id);
      if (!r.ok) alert(r.error);
      else router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">상품 (식자재)</h1>
          <p className="mt-1 text-sm text-slate-500">
            품목 마스터 · KAMIS 시세·매입원가·마진이 AI 입찰 분석으로 연결됩니다
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
            + 상품 등록
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
              <th className="px-4 py-3">상품명</th>
              <th className="px-4 py-3">분류</th>
              <th className="px-4 py-3 text-right">매입가</th>
              <th className="px-4 py-3 text-right">판매가</th>
              <th className="px-4 py-3 text-right">마진</th>
              <th className="px-4 py-3">인증/KAMIS</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                  등록된 상품이 없습니다.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const m = marginPct(p);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">{p.name}</span>
                      <span className="ml-1 text-xs text-slate-400">/{p.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular text-slate-600">{priceText(p.purchasePrice)}</td>
                    <td className="px-4 py-3 text-right tabular text-slate-700">{priceText(p.salePrice)}</td>
                    <td className="px-4 py-3 text-right tabular font-semibold text-emerald-600">
                      {m == null ? "-" : `${m}%`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        {p.isEco && (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">친환경</span>
                        )}
                        {p.cert && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{p.cert}</span>
                        )}
                        {p.kamisItemCode && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">KAMIS {p.kamisItemCode}</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setOpen(true);
                        }}
                        className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => onDelete(p)}
                        disabled={pending}
                        className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? "상품 수정" : "상품 등록"} onClose={() => setOpen(false)}>
          <EntityForm
            fields={FIELDS}
            initial={editing as unknown as Record<string, unknown>}
            action={saveProduct}
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
