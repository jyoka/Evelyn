"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "H" },
  { href: "/feed", label: "Feed", icon: "F" },
  { href: "/trends", label: "Trends", icon: "T" },
  { href: "/sources", label: "Sources", icon: "S" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg min-w-[60px] transition-colors ${
                active
                  ? "text-accent"
                  : "text-muted"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  active ? "bg-accent text-white" : "bg-transparent"
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
