"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";

interface FilterBarProps {
  sources: { id: number; label: string }[];
}

export default function FilterBar({ sources }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/feed?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Search articles..."
        defaultValue={searchParams.get("search") || ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            updateParam("search", e.currentTarget.value);
          }
        }}
        className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
      />

      <select
        value={searchParams.get("category") || ""}
        onChange={(e) => updateParam("category", e.target.value)}
        className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("source") || ""}
        onChange={(e) => updateParam("source", e.target.value)}
        className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent"
      >
        <option value="">All Sources</option>
        {sources.map((src) => (
          <option key={src.id} value={src.id}>
            {src.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("minRelevance") || ""}
        onChange={(e) => updateParam("minRelevance", e.target.value)}
        className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent"
      >
        <option value="">Any Relevance</option>
        <option value="7">7+ High</option>
        <option value="8">8+ Very High</option>
        <option value="9">9+ Critical</option>
      </select>
    </div>
  );
}
