"use client";

import { useState } from "react";

export default function CollectButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const authHeaders: HeadersInit = process.env.NEXT_PUBLIC_API_SECRET
    ? { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}` }
    : {};

  async function handleCollect() {
    setLoading(true);
    setStatus("Collecting articles...");

    try {
      const collectRes = await fetch("/api/collect", {
        method: "POST",
        headers: authHeaders,
      });
      const collectData = await collectRes.json();

      if (!collectData.success) {
        setStatus("Collection failed. Check console.");
        setLoading(false);
        return;
      }

      const totalAdded = collectData.results.reduce(
        (sum: number, r: { added: number }) => sum + r.added,
        0
      );
      setStatus(`Collected ${totalAdded} new articles. Processing...`);

      const processRes = await fetch("/api/process", {
        method: "POST",
        headers: authHeaders,
      });
      const processData = await processRes.json();

      if (processData.success) {
        setStatus(
          `Done! Processed ${processData.processed} articles. Generating digest...`
        );

        await fetch("/api/digest", { method: "POST", headers: authHeaders });
        setStatus("Complete! Refresh to see updates.");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setStatus(`Collected ${totalAdded} articles (processing requires API key).`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Error occurred. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <button
        onClick={handleCollect}
        disabled={loading}
        className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {loading ? "Working..." : "Collect & Process"}
      </button>
      {status && <span className="text-xs text-muted">{status}</span>}
    </div>
  );
}
