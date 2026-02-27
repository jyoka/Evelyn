import { prisma } from "@/lib/db";
import CollectButton from "@/components/CollectButton";
import InsightCard from "@/components/InsightCard";
import TrendingChip from "@/components/TrendingChip";
import ArticleCard from "@/components/ArticleCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [digest, recentArticles, stats] = await Promise.all([
    prisma.digest.findFirst({ orderBy: { date: "desc" } }),
    prisma.article.findMany({
      where: { processed: true },
      include: { source: true },
      orderBy: { relevance: "desc" },
      take: 6,
    }),
    prisma.article.count(),
  ]);

  const topInsights: string[] = digest
    ? (() => {
        try {
          return JSON.parse(digest.topInsights);
        } catch {
          return [];
        }
      })()
    : [];
  const trendingTopics: string[] = digest
    ? (() => {
        try {
          return JSON.parse(digest.trendingTopics);
        } catch {
          return [];
        }
      })()
    : [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            AI Intelligence Briefing
          </h1>
          <p className="text-sm text-muted mt-1">
            {stats} articles collected
            {digest &&
              ` · Last digest: ${new Date(digest.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
          </p>
        </div>
        <CollectButton />
      </div>

      {/* Daily Briefing */}
      {digest ? (
        <section className="mb-10">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Today&apos;s Briefing
            </h2>
            <div className="prose prose-invert prose-sm max-w-none">
              {digest.briefing.split("\n").map((p, i) => (
                <p key={i} className="text-foreground/90 leading-relaxed mb-3">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-10">
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <h2 className="text-lg font-semibold text-white mb-2">
              Welcome to Evelyn
            </h2>
            <p className="text-muted text-sm mb-4">
              Click &quot;Collect &amp; Process&quot; to fetch the latest AI news
              and generate your first briefing.
            </p>
            <p className="text-muted text-xs">
              Make sure to set your ANTHROPIC_API_KEY in .env for AI-powered
              summaries.
            </p>
          </div>
        </section>
      )}

      {/* Trending Topics */}
      {trendingTopics.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">
            Trending Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <TrendingChip key={topic} topic={topic} />
            ))}
          </div>
        </section>
      )}

      {/* Top Insights */}
      {topInsights.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">
            Key Insights
          </h2>
          <div className="space-y-3">
            {topInsights.map((insight, i) => (
              <InsightCard key={i} insight={insight} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Top Articles */}
      {recentArticles.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">
            Top Articles
          </h2>
          <div className="grid gap-4">
            {recentArticles.map((article) => (
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
        </section>
      )}
    </div>
  );
}
