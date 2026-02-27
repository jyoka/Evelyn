import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const sources = await prisma.source.findMany({
    include: {
      _count: { select: { articles: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Sources</h1>
        <p className="text-sm text-muted mt-1">
          {sources.length} configured sources
        </p>
      </div>

      <div className="grid gap-4">
        {sources.map((source) => (
          <div
            key={source.id}
            className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-base font-semibold text-white">
                  {source.label}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    source.type === "rss"
                      ? "bg-orange-500/20 text-orange-300"
                      : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {source.type.toUpperCase()}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    source.enabled
                      ? "bg-green-500/20 text-green-300"
                      : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {source.enabled ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-muted truncate max-w-md">
                {source.url}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {source._count.articles}
              </p>
              <p className="text-xs text-muted">articles</p>
            </div>
          </div>
        ))}
      </div>

      {sources.length === 0 && (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-muted">
            No sources configured. Run the seed script to add default sources.
          </p>
        </div>
      )}
    </div>
  );
}
