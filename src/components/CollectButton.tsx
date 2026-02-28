"use client";

import { useState } from "react";

type Step = "idle" | "collect" | "process" | "digest" | "done" | "error";

interface ProcessProgress {
  processed: number;
  errors: number;
  total: number;
  done: boolean;
}

const STEPS = [
  { key: "collect" as const, label: "Collecting articles" },
  { key: "process" as const, label: "AI processing" },
  { key: "digest" as const, label: "Generating briefing" },
];

export default function CollectButton() {
  const [step, setStep] = useState<Step>("idle");
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [collected, setCollected] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [collectLabel, setCollectLabel] = useState("Collecting articles");

  function getStepStatus(stepKey: string) {
    const order = STEPS.map((s) => s.key);
    const currentIdx = order.indexOf(step as typeof STEPS[number]["key"]);
    const stepIdx = order.indexOf(stepKey as typeof STEPS[number]["key"]);

    if (step === "done") return "done";
    if (step === "error") return currentIdx >= stepIdx ? "error" : "pending";
    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  }

  async function handleCollect() {
    setStep("collect");
    setProgress(null);
    setCollected(0);
    setError(null);

    try {
      // Step 1: Collect (per-source to stay under Vercel 10s limit)
      await fetch("/api/collect/seed", { method: "POST" });

      let totalAdded = 0;

      // Collect HN and ArXiv
      for (const source of ["hackernews", "arxiv"]) {
        setCollectLabel(`Collecting ${source}...`);
        try {
          const res = await fetch(`/api/collect/${source}`, { method: "POST" });
          const data = await res.json();
          if (data.added) totalAdded += data.added;
        } catch {
          // Individual source failure is non-fatal
        }
      }

      // Collect RSS feeds one at a time (each feed is its own API call)
      try {
        const rssRes = await fetch("/api/collect/rss", { method: "POST" });
        const rssData = await rssRes.json();
        if (rssData.feeds) {
          for (const feed of rssData.feeds) {
            setCollectLabel(`Collecting ${feed.label}...`);
            try {
              const res = await fetch(`/api/collect/${feed.name}`, { method: "POST" });
              const data = await res.json();
              if (data.added) totalAdded += data.added;
            } catch {
              // Individual feed failure is non-fatal
            }
          }
        }
      } catch {
        // RSS list fetch failed, skip
      }

      setCollected(totalAdded);

      // Step 2: Process (streaming)
      setStep("process");
      const processRes = await fetch("/api/process", { method: "POST" });

      if (processRes.body) {
        const reader = processRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              try {
                const p: ProcessProgress = JSON.parse(line);
                setProgress(p);
              } catch {
                // skip malformed lines
              }
            }
          }
        }
      }

      // Step 3: Digest
      setStep("digest");
      await fetch("/api/digest", { method: "POST" });

      // Done
      setStep("done");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      setStep("error");
    }
  }

  const isActive = step !== "idle";

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleCollect}
        disabled={isActive && step !== "done" && step !== "error"}
        className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {isActive && step !== "done" && step !== "error"
          ? "Working..."
          : "Collect & Process"}
      </button>

      {isActive && (
        <div className="bg-surface border border-border rounded-xl p-4 min-w-[260px]">
          <div className="space-y-3">
            {STEPS.map((s) => {
              const status = getStepStatus(s.key);
              return (
                <div key={s.key} className="flex items-center gap-3">
                  {/* Step indicator */}
                  <div className="flex-shrink-0">
                    {status === "done" ? (
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : status === "active" ? (
                      <div className="spinner" />
                    ) : status === "error" ? (
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-surface-hover" />
                    )}
                  </div>

                  {/* Step label + detail */}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm ${
                        status === "active"
                          ? "text-white font-medium"
                          : status === "done"
                            ? "text-muted"
                            : "text-muted/50"
                      }`}
                    >
                      {s.key === "collect" && step === "collect" ? collectLabel : s.label}
                    </span>

                    {/* Collect detail */}
                    {s.key === "collect" && status === "done" && (
                      <span className="text-xs text-muted ml-2">
                        {collected} new
                      </span>
                    )}

                    {/* Process progress */}
                    {s.key === "process" &&
                      status === "active" &&
                      progress &&
                      progress.total > 0 && (
                        <div className="mt-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent rounded-full transition-all duration-300"
                                style={{
                                  width: `${(progress.processed / progress.total) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted tabular-nums">
                              {progress.processed}/{progress.total}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Done / Error message */}
          {step === "done" && (
            <p className="text-xs text-green-400 mt-3">
              Complete! Refreshing...
            </p>
          )}
          {step === "error" && error && (
            <p className="text-xs text-red-400 mt-3">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
