"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/feed", label: "Feed", icon: "📰" },
  { href: "/trends", label: "Trends", icon: "📈" },
  { href: "/sources", label: "Sources", icon: "🔗" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-surface border-r border-border flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Evelyn
        </h1>
        <p className="text-xs text-muted mt-1">AI Intelligence Dashboard</p>
      </div>

      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                active
                  ? "bg-accent text-white font-medium"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted">
          Powered by Claude AI
        </p>
      </div>
    </aside>
  );
}
