const CATEGORY_COLORS: Record<string, string> = {
  "AI Agents": "bg-violet-500/20 text-violet-300",
  "Large Language Models": "bg-blue-500/20 text-blue-300",
  "Computer Vision": "bg-emerald-500/20 text-emerald-300",
  "Robotics": "bg-orange-500/20 text-orange-300",
  "AI Tools & Products": "bg-cyan-500/20 text-cyan-300",
  "AI Safety & Ethics": "bg-rose-500/20 text-rose-300",
  "Industry News": "bg-amber-500/20 text-amber-300",
  "Research Papers": "bg-indigo-500/20 text-indigo-300",
  "Open Source": "bg-green-500/20 text-green-300",
  "Tutorials & Guides": "bg-pink-500/20 text-pink-300",
};

export default function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] || "bg-slate-500/20 text-slate-300";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {category}
    </span>
  );
}
