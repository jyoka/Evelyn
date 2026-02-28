export default function SourcesLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="skeleton h-7 w-32 mb-6" />

      <div className="grid gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="skeleton h-4 w-40 mb-2" />
                <div className="skeleton h-3 w-56" />
              </div>
              <div className="skeleton h-8 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
