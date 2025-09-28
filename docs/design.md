# Design Document

## Overview

本ドキュメントは、既存の Tech Blog（Next.js 15 + App Router + React 19 + microCMS）を**本番運用レベル**に高めるための設計指針を示します。テーマは **SEO / セキュリティ / パフォーマンス / 運用信頼性 / アクセシビリティ**。
全面リライトは避け、**互換性を保った増築**（Incremental Enhancement）で実装します。

---

## Architecture

### 現状構成（要約）
- **UI**: Next.js 15（App Router, RSC）, Tailwind v4
- **CMS**: microCMS
- **テーマ**: `next-themes`
- **型**: TypeScript
- **UI基盤**: Radix UI（または等価のアクセシブルコンポーネント）

### 目標アーキテクチャ（強化点）
- **データ層**: microCMS SDK依存を外し、**Native fetch + Zod** + Next.js キャッシュ（`revalidate`, `tags`）
- **描画**: 重要領域は SSR/SSG で初期 HTML を返し、**“Loading …” を Above-the-fold で出さない**
- **SEO**: `metadata` 集約 + **JSON-LD（WebSite / BlogPosting / BreadcrumbList）** + **カノニカル**
- **画像**: Next.js `<Image>` + remotePatterns + `sizes`/`priority` + **フォールバック**
- **フォント**: `next/font`（可変/サブセット/自動プリロード）で **CLS 最小化**
- **セキュリティ**: ヘッダ群 + **CSP 段階導入（Report-Only → Enforce）** + `frame-ancestors`
- **運用**: Webhook 再検証, Resend, Turnstile, Vercel Analytics/Speed Insights, Lighthouse CI/Axe

```mermaid
graph TB
  subgraph Client
    A[Browser] --> B[Next.js App Router]
    B --> C[React Server Components]
    B --> D[Client Components]
  end

  subgraph App
    C --> E[Pages/Layouts]
    D --> F[Interactive UI]
    E --> G[Data Layer (fetch+Zod)]
    F --> G
  end

  subgraph Data
    G --> H[CMS Client]
    H --> I[Zod Validation]
    H --> J[Cache (revalidate,tags)]
    J --> K[microCMS]
  end

  subgraph Infra
    L[Security Headers/CSP]
    M[SEO (metadata, JSON-LD, canonical, OG)]
    N[Perf (SSG/SSR, next/font, images)]
    O[Ops (Webhook, Resend, Turnstile, Analytics)]
    P[CI (Lighthouse/Axe)]
  end

  B --> L
  B --> M
  B --> N
  B --> O
  O --> P
````

---

## Components & Interfaces

### 1. 環境変数バリデーション

**目的**: 起動時に不足・不正を即検知。
**実装**: `src/lib/env.ts` に Zod で定義。`process.env` を型安全に提供。

```ts
// src/lib/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  MICROCMS_SERVICE_DOMAIN: z.string().min(1),
  MICROCMS_API_KEY: z.string().min(1),
  REVALIDATE_SECRET: z.string().min(10),
  RESEND_API_KEY: z.string().optional(),
  CONTACT_TO: z.string().email().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
});

export const ENV = EnvSchema.parse({
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  MICROCMS_SERVICE_DOMAIN: process.env.MICROCMS_SERVICE_DOMAIN,
  MICROCMS_API_KEY: process.env.MICROCMS_API_KEY,
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CONTACT_TO: process.env.CONTACT_TO,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
});
```

---

### 2. CMS データ層（fetch + Zod + キャッシュ）

**方針**: SDKを外し、**Native fetch** で Next.js のキャッシュ制御を最大活用。
**戻り値**: リスト API は **`{ items, totalCount }`** を返し、ページネーションを正確化。

```ts
// src/lib/schemas.ts
import { z } from "zod";

export const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  summary: z.string().optional(),
  body: z.string().optional(),
  eyecatch: z.string().url().optional(),
  tags: z.array(TagSchema).default([]),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
  author: z.object({ name: z.string() }).optional(),
});

export type Tag = z.infer<typeof TagSchema>;
export type Post = z.infer<typeof PostSchema>;
```

```ts
// src/lib/cms.ts
import { ENV } from "./env";
import { PostSchema, TagSchema, type Post, type Tag } from "./schemas";

const BASE = `https://${ENV.MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1`;

export interface CMSListResult<T> {
  items: T[];
  totalCount: number;
}

async function mc(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-MICROCMS-API-KEY": ENV.MICROCMS_API_KEY },
    next: { revalidate: 60, tags: ["posts", "tags"] },
    ...init,
  });
  if (!res.ok) throw new Error(`microCMS error: ${res.status}`);
  return res.json();
}

export async function getPosts(params: { limit?: number; offset?: number; query?: string; tag?: string } = {}): Promise<CMSListResult<Post>> {
  const qs = new URLSearchParams();
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));
  if (params.query) qs.set("q", params.query);
  if (params.tag) qs.set("filters", `tags[contains]${params.tag}`);

  const json = await mc(`/posts?${qs.toString()}`);
  const items = (json.contents ?? []).map((c: unknown) => PostSchema.parse(c)) as Post[];
  return { items, totalCount: Number(json.totalCount ?? items.length) };
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const json = await mc(`/posts?filters=slug[equals]${slug}&limit=1`);
  const item = (json.contents ?? [])[0];
  return PostSchema.parse(item);
}

export async function getAllPostSlugs(): Promise<string[]> {
  const json = await mc(`/posts?fields=slug&limit=1000`);
  return (json.contents ?? []).map((c: any) => String(c.slug));
}

export async function getTags(): Promise<Tag[]> {
  const json = await mc(`/tags?limit=1000`);
  return (json.contents ?? []).map((c: unknown) => TagSchema.parse(c)) as Tag[];
}
```

**Webhook 再検証**（microCMS → Next API）

```ts
// src/app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from "next/cache";
import { ENV } from "@/lib/env";

export async function POST(req: Request) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== ENV.REVALIDATE_SECRET) return new Response("Unauthorized", { status: 401 });

  revalidateTag("posts");
  revalidateTag("tags");
  revalidatePath("/blog");
  revalidatePath("/");
  return Response.json({ revalidated: true, now: Date.now() });
}
```

---

### 3. SEO / メタデータ / JSON-LD / カノニカル

**方針**: `layout.tsx` でサイト共通メタ、記事・一覧は `generateMetadata` を実装。
**JSON-LD**: ルート＝`WebSite`、記事＝`BlogPosting`、パンくず＝`BreadcrumbList`。

```ts
// src/lib/seo.ts
export const jsonLd = (obj: unknown) => ({ __html: JSON.stringify(obj) });

export function websiteJsonLd(baseUrl: string, siteName: string) {
  return { "@context": "https://schema.org", "@type": "WebSite", url: baseUrl, name: siteName };
}
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}
export function articleJsonLd(post: { title: string; slug: string; publishedAt: string; updatedAt?: string; image?: string; author?: string }, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    image: post.image,
    author: post.author ? [{ "@type": "Person", name: post.author }] : undefined,
    mainEntityOfPage: `${baseUrl}/blog/${post.slug}`,
  };
}
```

**記事ページ例（抜粋）**

```tsx
// src/app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { ENV } from "@/lib/env";
import { getAllPostSlugs, getPostBySlug } from "@/lib/cms";
import { articleJsonLd, jsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  const url = `${ENV.NEXT_PUBLIC_BASE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.summary ?? "",
    alternates: { canonical: url },
    openGraph: { title: post.title, description: post.summary ?? "", url, type: "article" },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary ?? "" },
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  const ld = articleJsonLd({
    title: post.title, slug: post.slug, publishedAt: post.publishedAt, updatedAt: post.updatedAt, image: post.eyecatch, author: post.author?.name
  }, ENV.NEXT_PUBLIC_BASE_URL);

  return (
    <article className="prose prose-zinc mx-auto max-w-3xl p-6 dark:prose-invert">
      <h1>{post.title}</h1>
      <p className="text-sm text-zinc-500">{new Date(post.publishedAt).toLocaleDateString("ja-JP")}</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      {post.body && <div dangerouslySetInnerHTML={{ __html: post.body }} />}
    </article>
  );
}
```

---

### 4. テーマ & タイポグラフィ（next/font + トークン）

**目的**: CLS を抑えつつ可読性を高める。
**実装**: `next/font` で Inter（または Mona Sans）と Noto Sans JP を可変/サブセットで導入。CSS 変数で適用。

```tsx
// src/app/layout.tsx（抜粋）
import { Inter } from "next/font/google";
import { Noto_Sans_JP } from "next/font/google";
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const noto = Noto_Sans_JP({ subsets: ["latin"], weight: ["400","500","700"], display: "swap", variable: "--font-noto" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.variable} ${noto.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

**グローバル・トークン（配色/余白/フォーカス）**

```css
/* src/app/globals.css（抜粋） */
:root {
  --bg: 250 250 250;
  --surface: 255 255 255;
  --elevated: 245 245 245;
  --text: 23 23 23;
  --muted: 113 113 122;
  --radius: 12px;
}
:root.dark {
  --bg: 15 15 16;
  --surface: 22 22 24;
  --elevated: 32 32 36;
  --text: 235 235 236;
  --muted: 160 160 170;
}
.card { background: rgb(var(--surface)); border: 1px solid rgb(var(--elevated)); border-radius: var(--radius); }
:focus-visible { outline: 2px solid rgba(0,128,255,.8); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { * { animation-duration:.01ms !important; transition-duration:.01ms !important; } }
```

---

### 5. ルーティング & レンダリング（SSR/SSG、No Spinner）

**方針**

* `/blog` 一覧は SSR（RSC）で初期表示を返し、**初期ビューにローディング表示を出さない**
* 記事詳細は `generateStaticParams` で **SSG + ISR**
* 検索/タグ/ページの状態は **URL パラメータ** で一貫管理（共有可能）

**一覧ページ（要点）**

* `getPosts` を SSR で呼び、`{ items, totalCount }` を用いてページネーションを正確化
* 検索入力は 300ms デバウンス + `router.replace()` で URL 同期
* タグピルは `aria-current` 的なアクティブ状態を視覚化

---

### 6. 検索 & フィルタ（totalCount 対応）

**IF**:

```ts
interface SearchParams { query?: string; tag?: string; page?: number; limit?: number; }
interface SearchResult {
  posts: Post[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
}
```

**設計**

* `totalCount` からページ数を算出
* URL 変更時はサーバーで再描画（RSC）
* 空結果メッセージを明確に（A11y 対応）

---

### 7. 画像最適化（`<Image>` / remotePatterns / alt / fallback）

**方針**

* `next.config.ts` の `images.remotePatterns` に microCMS ドメインを登録
* LCP 対象は `priority`、レスポンシブは `sizes` 必須
* **意味のある `alt`** を徹底し、失敗時はプレースホルダー（CSS/背景色/アイコン）

---

### 8. 問い合わせフォーム（Route Handler + Zod + Turnstile + Resend）

**プロセス**

1. クライアント：フォーム入力 → `fetch('/contact/send')`
2. サーバ：Zod 検証 → Turnstile 検証（任意） → Resend 送信 → 結果返却
3. A11y：`aria-live="polite"` で結果を告知、各入力に `aria-describedby` でエラーメッセージを関連付け

---

### 9. アクセシビリティ

* `<html lang="ja">` を厳守
* **スキップリンク** と **フォーカスリング** を実装
* フォームは **label/aria-invalid/aria-describedby** を正しく関連付け
* **`prefers-reduced-motion`** を尊重
* ナビゲーションの現在地に **`aria-current="page"`**

---

### 10. セキュリティ

**ヘッダ（`next.config.ts`）**

* `X-Frame-Options: SAMEORIGIN`
* `X-Content-Type-Options: nosniff`
* `Referrer-Policy: strict-origin-when-cross-origin`
* `Permissions-Policy: camera=(), microphone=(), geolocation=()`

**CSP 段階導入**

1. **Report-Only** で違反収集
2. 問題解消後 **Enforce**
3. クリックジャッキング対策は **`frame-ancestors`** を採用（互換目的で XFO 併用）

---

### 11. モニタリング & アナリティクス

* **Vercel Analytics / Speed Insights** を導入（非同期読み込み・障害時も安全）
* 可能な範囲で **DNT** 等のプライバシーシグナルに配慮し、**PII を収集しない**

---

### 12. エラー/NotFound

* `app/not-found.tsx`：404 を明確に伝え、トップ/一覧へのリンクを提示
* `app/error.tsx`：ユーザーフレンドリーなメッセージ。サーバ側は**構造化ログ**で原因追跡
* CMS 未検出は **404** を返却（汎用 500 でごまかさない）

---

## Error Handling Strategy（型）

```ts
type FetchError =
  | { type: "network"; message: string }
  | { type: "validation"; message: string; field?: string }
  | { type: "notFound"; message: string };

type FormError =
  | { type: "validation"; fields: Record<string, string[]> }
  | { type: "bot"; message: string }
  | { type: "email"; message: string }
  | { type: "unknown"; message: string };
```

---

## Performance Strategy

* **Core Web Vitals 目標**: LCP < 2.5s / FID < 100ms / CLS < 0.1
* **SSR/SSG**: 重要領域は初期 HTML を返す（“Loading …” は初期表示に出さない）
* **画像**: `sizes`/`priority`/lazy, 正確な `width/height`
* **フォント**: `next/font`（可変/サブセット/プリロード）で CLS 低減
* **バンドル**: `optimizePackageImports`、不要な `use client` を削減
* **キャッシュ**: `revalidate` + `tags`、Webhook で選択的無効化

---

## Monitoring & Quality Gates（CI連携）

* **Lighthouse CI** しきい値: Perf ≥ 0.90 / A11y ≥ 0.95 / BP ≥ 0.90 / SEO ≥ 0.95（未達はブロック）
* **Axe-core** 自動テスト：キーボード操作、コントラスト、ラベル関連の回帰検出
* 主要フローの E2E（コンタクト送信、検索/タグ/ページング、メタ/JSON-LD 検証）

---

## 実装ノート（抜粋）

* `ThemeProvider` は `next-themes` ラッパで疎結合化し、トグルは `aria-label` 付き
* すべての画像に `alt` を付け、装飾目的は空文字 `alt=""`（スクリーンリーダー非読み上げ）
* RSS は `feed` ライブラリ、OG 画像は `@vercel/og`（1200×630）
* `robots.ts` に `sitemap.xml` を参照させる
* `sitemap.ts` は静的ページ + 記事 slug を統合
* `app/blog/page.tsx` は `query/tag/page` を Zod でパースし、SSR で描画
* `next.config.ts` の `images.remotePatterns` に microCMS ドメインを追加

---

## 付録：代表コード（要点のみ）

**OG 画像（サイト既定）**

```tsx
// src/app/opengraph-image.tsx
import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0F1011",color:"#fff",fontSize:64 }}>
      Tech Blog
    </div>, size
  );
}
```

**robots/sitemap**

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";
import { ENV } from "@/lib/env";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${ENV.NEXT_PUBLIC_BASE_URL}/sitemap.xml`, host: ENV.NEXT_PUBLIC_BASE_URL };
}

// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { ENV } from "@/lib/env";
import { getAllPostSlugs } from "@/lib/cms";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPostSlugs();
  return [
    { url: `${ENV.NEXT_PUBLIC_BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${ENV.NEXT_PUBLIC_BASE_URL}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${ENV.NEXT_PUBLIC_BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${ENV.NEXT_PUBLIC_BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
    ...posts.map((slug) => ({ url: `${ENV.NEXT_PUBLIC_BASE_URL}/blog/${slug}`, changeFrequency: "weekly", priority: 0.8 })),
  ];
}
```

**Error/NotFound**

```tsx
// src/app/not-found.tsx
export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl p-8 text-center">
      <h1 className="text-2xl font-bold">404 Not Found</h1>
      <p className="mt-2 text-sm text-zinc-500">お探しのページは見つかりませんでした。</p>
    </main>
  );
}

// src/app/error.tsx
"use client";
export default function Error({ error }: { error: Error }) {
  return (
    <main className="mx-auto max-w-xl p-8 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-500">{error.message}</p>
    </main>
  );
}
```

---
