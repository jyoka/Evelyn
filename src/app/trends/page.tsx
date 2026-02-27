import { prisma } from "@/lib/db";
import TrendingChip from "@/components/TrendingChip";

export const dynamic = "force-dynamic";

export default async function TrendsPage() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [articles, digests] = await Promise.all([
    prisma.article.findMany({
      where: {
        processed: true,
        collectedAt: { gte: sevenDaysAgo },
      },
      include: { source: true },
    }),
    prisma.digest.findMany({
      orderBy: { date: "desc" },
      take: 7,
    }),
  ]);

  // Category distribution
  const categoryMap: Record<string, number> = {};
  for (const a of articles) {
    if (a.category) {
      categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
    }
  }
  const categories = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const maxCategory = categories[0]?.count || 1;

  // Source distribution
  const sourceMap: Record<string, number> = {};
  for (const a of articles) {
    const label = a.source.label;
    sourceMap[label] = (sourceMap[label] || 0) + 1;
  }
  const sources = Object.entries(sourceMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const maxSource = sources[0]?.count || 1;

  // Trending tags
  const tagMap: Record<string, number> = {};
  for (const a of articles) {
    if (a.tags) {
      try {
        const tags: string[] = JSON.parse(a.tags);
        for (const tag of tags) {
          tagMap[tag] = (tagMap[tag] || 0) + 1;
        }
      } catch {
        // skip
      }
    }
  }
  const trendingTags = Object.entries(tagMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Digest trending topics
  const allTrendingTopics: string[] = [];
  for (const d of digests) {
    try {
      const topics: string[] = JSON.parse(d.trendingTopics);
      allTrendingTopics.push(...topics);
    } catch {
      // skip
    }
  }
  const uniqueTopics = [...new Set(allTrendingTopics)];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Trends</h1>
        <p className="text-sm text-muted mt-1">
          AI landscape over the past 7 days · {articles.length} articles
          analyzed
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-muted">
            No data yet. Collect and process articles to see trends.
          </p>
        </div>
      ) : (
        <>
          {/* Trending Topics from Digests */}
          {uniqueTopics.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-white mb-4">
                Trending Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {uniqueTopics.map((topic) => (
                  <TrendingChip key={topic} topic={topic} />
                ))}
              </div>
            </section>
          )}

          {/* Category Distribution */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-white mb-4">
              Categories
            </h2>
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-44 truncate">
                    {cat.name}
                  </span>
                  <div className="flex-1 bg-background rounded-full h-5 overflow-hidden">
                    <div
                      className="bg-accent h-full rounded-full transition-all"
                      style={{
                        width: `${(cat.count / maxCategory) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted w-8 text-right">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Source Distribution */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-white mb-4">
              Sources
            </h2>
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              {sources.map((src) => (
                <div key={src.name} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-44 truncate">
                    {src.name}
                  </span>
                  <div className="flex-1 bg-background rounded-full h-5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{
                        width: `${(src.count / maxSource) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted w-8 text-right">
                    {src.count}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Tags */}
          {trendingTags.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">
                Popular Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag) => (
                  <span
                    key={tag.name}
                    className="px-3 py-1.5 rounded-full text-sm bg-surface border border-border text-muted"
                  >
                    {tag.name}{" "}
                    <span className="text-xs text-muted/60">({tag.count})</span>
                  </span>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
