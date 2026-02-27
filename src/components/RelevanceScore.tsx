export default function RelevanceScore({ score }: { score: number }) {
  const color =
    score >= 8
      ? "text-green-400"
      : score >= 5
        ? "text-yellow-400"
        : "text-slate-400";

  return (
    <span className={`text-sm font-mono font-bold ${color}`} title={`Relevance: ${score}/10`}>
      {score}/10
    </span>
  );
}
