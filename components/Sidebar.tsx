"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS: { title: string; items: { href: string; label: string; icon: string }[] }[] = [
  {
    title: "인텔리전스",
    items: [
      { href: "/", label: "대시보드", icon: "▣" },
      { href: "/bids", label: "입찰 공고", icon: "▤" },
      { href: "/prices", label: "가격 추적", icon: "▦" },
      { href: "/analysis", label: "AI 입찰 분석", icon: "✦" },
    ],
  },
  {
    title: "운영",
    items: [
      { href: "/deliveries", label: "납품 보드", icon: "▤" },
      { href: "/contracts", label: "납품 표준표", icon: "▣" },
      { href: "/purchases", label: "매입", icon: "◀" },
    ],
  },
  {
    title: "마스터",
    items: [
      { href: "/customers", label: "거래처", icon: "◉" },
      { href: "/products", label: "상품", icon: "◈" },
      { href: "/suppliers", label: "공급처", icon: "◐" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-brand text-white flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-xl font-bold tracking-tight">allfoods</div>
        <div className="mt-1 text-[11px] text-white/55 leading-tight">
          급식 식자재 입찰·가격
          <br />
          인텔리전스
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
              {group.title}
            </div>
            {group.items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  <span className="w-4 text-center opacity-80">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-white/10 text-[11px] text-white/45">
        <div>경북 예천·영주 1차</div>
        <div className="mt-0.5">admin · 프로토타입</div>
      </div>
    </aside>
  );
}
