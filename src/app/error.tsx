"use client";

import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Error</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">問題が発生しました</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          一時的なエラーが発生しました。お手数ですが再度お試しください。
        </p>
        <p className="mt-2 text-xs text-muted-foreground/80">{error.message}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-primary px-5 py-2 text-primary-foreground transition hover:bg-primary/90"
        >
          リロードする
        </button>
        <Link
          href="/"
          className="rounded-md border border-border px-5 py-2 transition hover:bg-muted"
        >
          ホームに戻る
        </Link>
      </div>
    </main>
  );
}
