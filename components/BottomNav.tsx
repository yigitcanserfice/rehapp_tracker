"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Dumbbell, History, ListChecks } from "lucide-react";

const items = [
  { href: "/", label: "Bugun", icon: CalendarCheck },
  { href: "/exercises", label: "Hareketler", icon: Dumbbell },
  { href: "/programs", label: "Programlar", icon: ListChecks },
  { href: "/history", label: "Gecmis", icon: History }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-12px_32px_rgba(23,32,27,0.08)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                active ? "bg-mint text-leaf" : "text-ink/55 active:bg-ink/5"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.6 : 2.1} />
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
