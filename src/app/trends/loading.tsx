export default function TrendsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="skeleton h-7 w-48 mb-6" />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4">
            <div className="skeleton h-3 w-20 mb-2" />
            <div className="skeleton h-6 w-12" />
          </div>
        ))}
      </div>

      {/* Category distribution */}
      <div className="skeleton h-5 w-44 mb-4" />
      <div className="bg-surface border border-border rounded-xl p-5 mb-10">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-4 flex-1 rounded-full" />
              <div className="skeleton h-4 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Trending tags */}
      <div className="skeleton h-5 w-32 mb-4" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-20 rounded-full" />
        ))}
      </div>
    </div>
  );
}
