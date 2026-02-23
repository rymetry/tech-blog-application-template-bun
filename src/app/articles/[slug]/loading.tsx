export default function ArticleSlugLoading() {
  return (
    <div className="editorial-scope">
      {/* ヒーローセクション */}
      <section className="w-full pt-24 pb-10 md:pt-32 md:pb-12 qa-hero-background qa-hero-soft article-hero-compact">
        <div className="container w-full">
          <div className="w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div
                className="article-hero-cover-compact article-hero-cover-placeholder animate-pulse"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-4">
              <div className="mx-auto h-9 w-3/4 max-w-lg rounded bg-muted animate-pulse" />
              {/* タグ */}
              <div className="mt-4 flex justify-center gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-16 rounded-full bg-muted/40 animate-pulse"
                  />
                ))}
              </div>
              {/* 著者・日付 */}
              <div className="mx-auto flex flex-wrap items-start justify-center gap-6 sm:gap-10">
                <div className="h-12 w-32 rounded bg-muted/30 animate-pulse" />
                <div className="flex flex-col gap-2">
                  <div className="h-5 w-28 rounded bg-muted/30 animate-pulse" />
                  <div className="h-5 w-28 rounded bg-muted/30 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 記事コンテンツ + TOC */}
      <article className="container w-full py-8 sm:py-10 md:py-12">
        <div className="mx-auto grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,960px)_280px] lg:items-start">
          <div className="min-w-0 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                {i % 3 === 1 && (
                  <div className="h-7 w-2/5 rounded bg-muted/50 animate-pulse" />
                )}
                <div className="h-4 w-full rounded bg-muted/20 animate-pulse" />
                <div className="h-4 w-11/12 rounded bg-muted/20 animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-muted/20 animate-pulse" />
              </div>
            ))}
          </div>
          {/* TOC サイドバー */}
          <div className="hidden lg:block min-w-0 space-y-3">
            <div className="h-5 w-20 rounded bg-muted/40 animate-pulse" />
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-4 rounded bg-muted/20 animate-pulse"
                style={{ width: `${60 + i * 8}%` }}
              />
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
