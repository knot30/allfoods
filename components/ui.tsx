// 공용 프레젠테이션 컴포넌트 (순수, 서버/클라이언트 공용).
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {right}
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "brand" | "warn" | "up" | "down";
}) {
  const toneCls = {
    default: "text-slate-900",
    brand: "text-brand",
    warn: "text-amber-600",
    up: "text-rose-600",
    down: "text-blue-600",
  }[tone];
  return (
    <Card className="p-5">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-bold tabular ${toneCls}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </Card>
  );
}

export function DemoBadge({ notice }: { notice?: string }) {
  return (
    <span
      title={notice}
      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      데모 데이터
    </span>
  );
}

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      실시간
    </span>
  );
}

export function DDayBadge({
  label,
  urgent,
  closed,
}: {
  label: string;
  urgent: boolean;
  closed: boolean;
}) {
  const cls = closed
    ? "bg-slate-100 text-slate-400"
    : urgent
      ? "bg-rose-100 text-rose-700"
      : "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
