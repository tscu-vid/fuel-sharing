"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseItems = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/drives", label: "Drives", icon: "🚗" },
  { href: "/refuels", label: "Fuel", icon: "⛽" },
  { href: "/settle", label: "Settle", icon: "💶" },
];

export default function BottomNav({ isManager }: { isManager: boolean }) {
  const pathname = usePathname();
  const items = isManager
    ? [...baseItems, { href: "/admin/users", label: "Admin", icon: "⚙️" }]
    : baseItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] ${
                active ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
