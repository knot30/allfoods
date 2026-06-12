// 표시용 포맷 헬퍼 (서버/클라이언트 공용, 순수 함수).

/** 1,234,000 → "123만 4,000원" 형태 compact 표기 */
export function won(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "미공개";
  if (n < 10000) return `${n.toLocaleString()}원`;
  const eok = Math.floor(n / 100_000_000);
  const man = Math.floor((n % 100_000_000) / 10_000);
  const rest = n % 10_000;
  const parts: string[] = [];
  if (eok) parts.push(`${eok}억`);
  if (man) parts.push(`${man.toLocaleString()}만`);
  if (rest && !eok) parts.push(`${rest.toLocaleString()}`);
  return parts.join(" ") + "원";
}

/** 정확한 원 단위 (콤마) */
export function wonFull(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "미공개";
  return `${n.toLocaleString()}원`;
}

export function formatDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function formatDateTime(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 마감까지 남은 일수 (오늘=0, 지남=음수) */
export function daysUntil(iso: string): number {
  if (!iso) return NaN;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return NaN;
  const now = new Date();
  const a = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

/** "D-1" / "오늘 마감" / "마감" */
export function dDay(iso: string): { label: string; urgent: boolean; closed: boolean } {
  const d = daysUntil(iso);
  if (Number.isNaN(d)) return { label: "-", urgent: false, closed: false };
  if (d < 0) return { label: "마감", urgent: false, closed: true };
  if (d === 0) return { label: "오늘 마감", urgent: true, closed: false };
  return { label: `D-${d}`, urgent: d <= 2, closed: false };
}

export function pct(n: number): string {
  return `${n > 0 ? "+" : ""}${n}%`;
}
