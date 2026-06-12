"use client";

// 마스터 공용: 모달 + 필드정의 기반 폼. 거래처/공급처/상품이 공유.
import { useActionState, useEffect } from "react";
import type { ActionResult } from "@/lib/types-master";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea" | "checkbox";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  full?: boolean; // 2칸 폭
  hint?: string;
}

type Action = (prev: ActionResult, fd: FormData) => Promise<ActionResult>;

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100">
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function EntityForm({
  fields,
  initial,
  action,
  onDone,
}: {
  fields: FieldDef[];
  initial: Record<string, unknown> | null;
  action: Action;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    action,
    { ok: false },
  );

  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <form action={formAction} className="space-y-3">
      {initial?.id ? <input type="hidden" name="id" value={String(initial.id)} /> : null}
      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => {
          const v = initial?.[f.name];
          const base =
            "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand";
          return (
            <label key={f.name} className={f.full ? "col-span-2" : "col-span-1"}>
              <span className="mb-1 block text-xs font-medium text-slate-500">
                {f.label}
                {f.required && <span className="text-rose-500"> *</span>}
              </span>
              {f.type === "select" ? (
                <select name={f.name} defaultValue={(v as string) ?? f.options?.[0]} className={base}>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea name={f.name} defaultValue={(v as string) ?? ""} rows={2} placeholder={f.placeholder} className={base} />
              ) : f.type === "checkbox" ? (
                <span className="flex h-9 items-center">
                  <input type="checkbox" name={f.name} defaultChecked={Boolean(v)} className="h-4 w-4 accent-brand" />
                  <span className="ml-2 text-sm text-slate-600">{f.hint ?? "예"}</span>
                </span>
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  name={f.name}
                  defaultValue={v == null ? "" : String(v)}
                  placeholder={f.placeholder}
                  required={f.required}
                  className={base}
                />
              )}
              {f.hint && f.type !== "checkbox" && (
                <span className="mt-0.5 block text-[11px] text-slate-400">{f.hint}</span>
              )}
            </label>
          );
        })}
      </div>

      {state.error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}
