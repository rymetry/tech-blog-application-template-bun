import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">404</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">お探しのページは見つかりませんでした</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          URL が間違っているか、ページが移動または削除された可能性があります。トップページから目的のページをお探しください。
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-md bg-primary px-5 py-2 text-primary-foreground transition hover:bg-primary/90"
        >
          ホームに戻る
        </Link>
        <Link
          href="/blog"
          className="rounded-md border border-border px-5 py-2 transition hover:bg-muted"
        >
          ブログ一覧を見る
        </Link>
      </div>
    </main>
  );
}
