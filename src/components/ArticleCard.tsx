import CategoryBadge from "./CategoryBadge";
import RelevanceScore from "./RelevanceScore";

interface ArticleCardProps {
  title: string;
  url: string;
  summary: string | null;
  category: string | null;
  relevance: number;
  source: string;
  publishedAt: string | null;
  tags: string | null;
}

export default function ArticleCard({
  title,
  url,
  summary,
  category,
  relevance,
  source,
  publishedAt,
  tags,
}: ArticleCardProps) {
  const parsedTags: string[] = tags ? (() => { try { return JSON.parse(tags); } catch { return []; } })() : [];
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <article className="bg-surface border border-border rounded-xl p-4 sm:p-5 hover:border-accent/50 transition-colors group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>{source}</span>
          {date && (
            <>
              <span>·</span>
              <span>{date}</span>
            </>
          )}
        </div>
        {relevance > 0 && <RelevanceScore score={relevance} />}
      </div>

      <h3 className="text-base font-semibold text-white mb-2 group-hover:text-accent-hover transition-colors">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      </h3>

      {summary && (
        <p className="text-sm text-muted leading-relaxed mb-3">{summary}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {category && <CategoryBadge category={category} />}
        {parsedTags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs text-muted bg-background px-2 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
