import { prisma } from "@/lib/db";
import ArticleCard from "@/components/ArticleCard";
import FilterBar from "@/components/FilterBar";

export const dynamic = "force-dynamic";

interface FeedPageProps {
  searchParams: Promise<{
    category?: string;
    source?: string;
    search?: string;
    minRelevance?: string;
    page?: string;
  }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 20;

  const where: Record<string, unknown> = {};

  if (params.category) where.category = params.category;
  if (params.source) where.sourceId = parseInt(params.source);
  if (params.minRelevance)
    where.relevance = { gte: parseInt(params.minRelevance) };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { summary: { contains: params.search } },
    ];
  }

  const [articles, total, sources] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { source: true },
      orderBy: [{ relevance: "desc" }, { collectedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
    prisma.source.findMany({
      select: { id: true, label: true },
      orderBy: { label: "asc" },
    }),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Article Feed</h1>
        <p className="text-sm text-muted mt-1">{total} articles</p>
      </div>

      <FilterBar sources={sources} />

      {articles.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-muted">
            No articles found. Try adjusting your filters or collect new
            articles.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              title={article.title}
              url={article.url}
              summary={article.summary}
              category={article.category}
              relevance={article.relevance}
              source={article.source.label}
              publishedAt={article.publishedAt?.toISOString() || null}
              tags={article.tags}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.min(pages, 10) }, (_, i) => {
            const p = i + 1;
            const params2 = new URLSearchParams();
            if (params.category) params2.set("category", params.category);
            if (params.source) params2.set("source", params.source);
            if (params.search) params2.set("search", params.search);
            if (params.minRelevance)
              params2.set("minRelevance", params.minRelevance);
            params2.set("page", String(p));

            return (
              <a
                key={p}
                href={`/feed?${params2.toString()}`}
                className={`px-3 py-1.5 rounded text-sm ${
                  p === page
                    ? "bg-accent text-white"
                    : "bg-surface text-muted hover:text-white hover:bg-surface-hover"
                }`}
              >
                {p}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
