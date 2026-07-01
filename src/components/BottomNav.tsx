"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, Car, Fuel, HandCoins, ShieldUser } from "lucide-react";

const baseItems = [
  { href: "/dashboard", label: "Home", icon: Gauge },
  { href: "/drives", label: "Drives", icon: Car },
  { href: "/refuels", label: "Fuel", icon: Fuel },
  { href: "/settle", label: "Settle", icon: HandCoins },
];

export default function BottomNav({ isManager }: { isManager: boolean }) {
  const pathname = usePathname();
  const items = isManager
    ? [...baseItems, { href: "/admin/users", label: "Admin", icon: ShieldUser }]
    : baseItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-ink-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-brand-500" : "text-ink-400"
              }`}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-500" />
              )}
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
