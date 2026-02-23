export default function ArticlesLoading() {
  return (
    <div className="editorial-scope">
      <div className="w-full pt-24 pb-10 md:pt-32 md:pb-12 qa-hero-background qa-hero-soft">
        <div className="container">
          <div className="h-10 w-48 rounded bg-muted animate-pulse" />
          <div className="mt-3 h-5 w-80 rounded bg-muted/60 animate-pulse" />
        </div>
      </div>
      <div className="container py-8 sm:py-10 md:py-12">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-[240px_1fr]">
          <div className="space-y-8">
            <div className="h-10 w-full rounded bg-muted/40 animate-pulse" />
            <div className="space-y-2">
              {['w-20', 'w-16', 'w-24', 'w-14', 'w-18'].map((w, i) => (
                <div key={i} className={`h-6 ${w} rounded bg-muted/30 animate-pulse`} />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted/20 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
