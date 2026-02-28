"use client";

import Link from "next/link";

interface DigestNavProps {
  prevDate: string | null;
  nextDate: string | null;
  allDates: string[];
}

export default function DigestNav({ prevDate, nextDate, allDates }: DigestNavProps) {
  if (allDates.length <= 1 && !prevDate && !nextDate) return null;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
      <div>
        {prevDate ? (
          <Link
            href={`/?date=${prevDate}`}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            &larr; {new Date(prevDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </Link>
        ) : (
          <span />
        )}
      </div>

      <Link
        href="/"
        className="text-xs text-muted hover:text-white transition-colors"
      >
        Latest
      </Link>

      <div>
        {nextDate ? (
          <Link
            href={`/?date=${nextDate}`}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            {new Date(nextDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
