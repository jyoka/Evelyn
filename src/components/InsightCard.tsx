export default function InsightCard({
  insight,
  index,
}: {
  insight: string;
  index: number;
}) {
  return (
    <div className="flex gap-3 p-4 bg-surface border border-border rounded-xl">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">
        {index + 1}
      </div>
      <p className="text-sm text-foreground leading-relaxed">{insight}</p>
    </div>
  );
}
