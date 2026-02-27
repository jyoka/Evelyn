export default function TrendingChip({ topic }: { topic: string }) {
  return (
    <span className="inline-block px-3 py-1.5 rounded-full text-sm font-medium bg-accent/10 text-accent-hover border border-accent/20 hover:bg-accent/20 transition-colors cursor-default">
      {topic}
    </span>
  );
}
