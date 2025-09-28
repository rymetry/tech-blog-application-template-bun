# tasks.md
本タスクリストは、改訂版 `requirements.md` / `design.md` を完全に実装するための**実行順序付きチェックリスト**です。
各タスクは「変更ファイル / 目的 / 作業項目 / 検証手順 / 関連要件ID」を明記しています。

---

## 0. 前提・セットアップ

**変更ファイル**
- `package.json`
- `bun-lock.yaml`（または `yarn.lock` / `package-lock.json`）

**目的**
- 依存パッケージを導入し、実装に必要な下地を整える

**作業項目**
- 依存追加：`zod` / `feed` / `@vercel/og` / `@vercel/analytics` / `next-themes`
- （任意）テスト系：`@playwright/test` または `vitest` / `jest`、`axe-core`、`@axe-core/playwright`
- スクリプト整備：`typecheck` / `lint` / `build` / `test` / `lhci` / `a11y` など

**検証**
- `bun i`（または `yarn`/`npm i`）成功
- `bun run build` が通る

**要件**
- R11-1, R11-3, R12-1, R12-2

---

## 1. 環境変数とセキュリティ基盤

**変更ファイル**
- `/.env.example`（新規）
- `src/lib/env.ts`（新規）
- `README.md`（envドキュメント追記）

**目的**
- 環境変数の**標準化**と**起動時検証**を実装

**作業項目**
- `.env.example` に必要キーを網羅：
  `NEXT_PUBLIC_BASE_URL`, `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`, `REVALIDATE_SECRET`, `RESEND_API_KEY?`, `CONTACT_TO?`, `TURNSTILE_SECRET_KEY?`
- `src/lib/env.ts` を `zod` で実装（起動時 `parse`）
- 失敗時の**明確なエラーメッセージ**を出す

**検証**
- 必須キーを抜いた状態で起動 → 期待通りに失敗すること
- `.env.example` の記載漏れがない

**要件**
- R1-1〜1-4, R11-4

---

## 2. 画像最適化 & セキュア設定

**変更ファイル**
- 画像を使う各コンポーネント（`<Image>` 化・sizes/priority/alt）

**目的**
- microCMS 画像最適化と**安全なドメイン制限**、`alt`/フォールバックの徹底

**作業項目**
- LCP 対象画像に `priority`、全画像に `sizes` を設定
- 画像エラー時のフォールバック（例：背景色/プレースホルダSVG/アイコン）
- 非装飾画像に**意味のある `alt`** を付与、装飾は `alt=""`

**検証**
- Lighthouse LCP 画像が `<img>`→`<Image>` で最適化される
- 画像ドメイン以外はブロックされる

**要件**
- R2-1〜2-4, R6-6

---

## 3. CMS データ層（fetch + Zod + キャッシュ）

**変更ファイル**
- `src/lib/schemas.ts`（新規/更新）
- `src/lib/cms.ts`（新規/更新）

**目的**
- SDK を外し、**native fetch + Zod** + `revalidate/tags` に統一
- リスト API を `{ items, totalCount }` に正規化

**作業項目**
- Post/Tag/Author/Image の `zod` スキーマを定義（最低 Post/Tag 必須）
- `getPosts(params)` が `{ items, totalCount }` を返す
- `getPostBySlug`, `getAllPostSlugs`, `getTags` を実装
- `fetch` オプション `next: { revalidate: 60, tags: ['posts','tags'] }` を採用

**検証**
- 型不一致で落ちること（Zod）
- ページネーションで `totalCount` が使われる

**要件**
- R5-1, R5-3, R5-5, R10-6

---

## 4. Webhook 再検証（On-demand ISR）

**変更ファイル**
- `src/app/api/revalidate/route.ts`（新規）
- `README.md`（microCMS Webhook 手順追記）

**目的**
- microCMS 更新時に**選択的無効化**を行う

**作業項目**
- `POST /api/revalidate`
  ヘッダ `x-revalidate-secret` 検証 → `revalidateTag('posts'|'tags')` + 主要パス `revalidatePath`
- README に microCMS 側の設定手順・ヘッダ名を明記

**検証**
- Webhook 実行で一覧・トップが更新される

**要件**
- R5-2, R5-5

---

## 5. SEO（メタ/OG/JSON-LD/カノニカル/サイトマップ/robots/RSS）

**変更ファイル**
- `src/app/layout.tsx`（メタ集約、`lang="ja"`、skip link）
- `src/app/opengraph-image.tsx`（新規：サイト共通OG）
- `src/app/blog/[slug]/opengraph-image.tsx`（新規：記事OG）
- `src/lib/seo.ts`（新規：JSON-LDヘルパ）
- `src/app/sitemap.ts`（新規）
- `src/app/robots.ts`（新規）
- `src/app/feed.xml/route.ts`（新規、`feed`利用）

**目的**
- 検索/共有を最大化し、**構造化データ**と**カノニカル**で重複回避

**作業項目**
- ルートに `WebSite`、記事に `BlogPosting`、階層に `BreadcrumbList` を埋め込み
- `generateMetadata` で OG/Twitter と `alternates.canonical` を返す
- `sitemap.ts` に全記事・主要ページを含める
- `robots.ts` に `sitemap.xml` と host を設定
- RSS を `/feed.xml` で配信（最新20件程度）

**検証**
- 構造化データの検証（Rich Result Test）
- カノニカルURLが全ページで一貫
- シェア時のOG画像が期待通り

**要件**
- R4-1〜4-7

---

## 6. SSG/SSR & 「Above-the-fold no-spinner」ポリシー

**変更ファイル**
- `src/app/blog/page.tsx`（SSR 一覧＋URLクエリ処理）
- `src/app/blog/[slug]/page.tsx`（`generateStaticParams` 追加）
- `src/app/not-found.tsx`（新規）
- `src/app/error.tsx`（新規、`"use client"`）

**目的**
- 初期表示でローディングを見せない。**SSG+ISR** を最大活用。

**作業項目**
- `/blog` は `searchParams` を `zod` でパース（`query/tag/page`）し SSR 描画
- 記事詳細は `generateStaticParams` で SSG + ISR
- 404/エラーページを実装（戻り動線/メッセージ明確化）

**検証**
- 初期表示で “Loading …” が出ない
- 存在しない記事で 404 になる

**要件**
- R6-1〜6, R13-1〜3

---

## 7. 検索・タグ・ページング（URL同期 + totalCount）

**変更ファイル**
- `src/app/blog/page.tsx`（検索/タグ/ページングUI）
- 必要に応じて小コンポーネント分割（`SearchBox`/`TagPills`/`Pagination`）

**目的**
- URL 同期された検索とフィルタ、正確なページング

**作業項目**
- 検索は 300ms デバウンス＋`router.replace()` で URL 更新
- タグ選択は `?tag=slug` を付与、Active 状態は視覚化（`aria-current` 相当）
- `totalCount` で `hasMore`/ページ数を算出
- 空結果メッセージ（A11y配慮）を表示

**検証**
- URL 共有で状態再現
- 空結果時のメッセージがスクリーンリーダーで伝わる

**要件**
- R10-1〜6

---

## 8. テーマ & トークン & フォント（next/font）

**変更ファイル**
- `src/components/providers/ThemeProvider.tsx`（新規）
- `src/components/ThemeToggle.tsx`（新規）
- `src/app/layout.tsx`（フォント導入）
- `src/app/globals.css`（配色/フォーカス/ReducedMotion/カード）

**目的**
- テーマの**切替/永続化**、CLS低減、可読性向上

**作業項目**
- `next-themes` で `ThemeProvider` とトグル実装（`aria-label` 付与）
- `next/font` で Inter(or Mona Sans) + Noto Sans JP（可変/サブセット）
  `display:"swap"`, `variable` で CSS 変数化、`body` に適用
- CSS カラートークン/フォーカスリング/Reduced Motion を追加

**検証**
- 初回のテーマフラッシュがない
- CLS が減る（Lighthouse/Speed Insights）

**要件**
- R3-1〜4, R6-6, R9-1〜2,4

---

## 9. 問い合わせフォーム（Route Handler + Zod + Turnstile + Resend）

**変更ファイル**
- `src/app/contact/page.tsx`
- `src/app/contact/ui/ContactForm.tsx`（新規）
- `src/app/contact/send/route.ts`（新規）

**目的**
- 安全でアクセシブルな問い合わせ機能の提供

**作業項目**
- クライアント：エラーメッセージを `aria-describedby` でフィールドに関連付け
  送信結果は `aria-live="polite"` で告知
- サーバ：Zod 検証 → Turnstile 検証（任意）→ Resend 送信
  エラーは意味のあるステータス/本文で返却

**検証**
- 正常送信/バリデーションエラー/Bot 検出/メール送信失敗 の各ケース
- 画面読み上げで状態が伝わる

**要件**
- R7-1〜5, R9-3

---

## 10. セキュリティヘッダ & CSP 段階導入

**変更ファイル**
- `next.config.ts`
- `README.md`（CSP導入手順と例）

**目的**
- 一般的な攻撃ベクトルの低減と段階導入

**作業項目**
- `X-Frame-Options: SAMEORIGIN` / `X-Content-Type-Options: nosniff` / `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **CSP**：Report-Only → 違反解消 → Enforce
  *将来施行時* `frame-ancestors` を採用（XFOは暫定互換）

**検証**
- 既存機能が壊れていない
- Report-Only で違反が収束してから Enforce

**要件**
- R8-1〜5

---

## 11. パフォーマンス監視 & アナリティクス

**変更ファイル**
- `src/app/layout.tsx`（`@vercel/analytics`, `@vercel/speed-insights`）
- （任意）`src/lib/analytics.ts`（DNT対応ユーティリティ）

**目的**
- CWV 監視と利用状況の把握（UXを阻害しない）

**作業項目**
- `Analytics` / `SpeedInsights` を導入（遅延/フェイルセーフ）
- 可能な範囲で **Do Not Track** に配慮（PII 収集禁止）

**検証**
- ネットワーク失敗時でもUXに影響がない

**要件**
- R11-1〜5

---

## 12. CI/CD（品質ゲート）

**変更ファイル**
- `.github/workflows/ci.yml`（新規/更新）
- `.github/workflows/lighthouse.yml`（任意・新規）
- `lighthouserc.json`（新規）
- （任意）`a11y.config.ts` / Playwright セットアップ

**目的**
- 変更の自動検証と**スコアしきい値**によるデプロイブロック

**作業項目**
- CI：`lint` / `typecheck` / `build` / `test` をPR/Pushで実行
- Lighthouse CI：
  Perf ≥ **0.90** / A11y ≥ **0.95** / BP ≥ **0.90** / SEO ≥ **0.95**（未達は fail）
- a11y 自動化（axe-core/Playwright）を nightly または PR で実行

**検証**
- 意図的にパフォーマンスを落として CI が fail することを確認
- a11y 違反の検出を確認

**要件**
- R12-1〜6

---

## 13. テスト & ドキュメント

**変更ファイル**
- `tests/**`（ユニット/統合/E2E）
- `README.md`（セットアップ/デプロイ手順/運用ポリシー）
- `docs/**`（任意）

**目的**
- 安心して変更できる土台を用意

**作業項目（テスト例）**
- **Unit**：Zod スキーマ / CMS アダプタ / ユーティリティ
- **Integration**：`/contact/send`（正常/エラー/Bot）、`/api/revalidate`
- **E2E**：検索/タグ/ページング、記事メタ/OG/JSON-LD、NotFound/Error
- **SEO/A11y 検証**：
  - JSON-LD（`WebSite`/`BlogPosting`/`BreadcrumbList`）の存在
  - `alternates.canonical`、`<html lang="ja">`、`aria-current`
  - 画像 `alt`、フォームの `aria-describedby`
- **ドキュメント**：env 変数、Webhook/CSP手順、運用ガイド

**検証**
- 主要フローがテストでカバーされ、CI 通過
- ドキュメントで新人がセットアップ可能

**要件**
- R5-3/4, R7-1/4/5, R9-1/2/3/5, R10-1〜6, R11, R12, R13

---

## 14. パフォーマンス仕上げ（最終微調整）

**変更ファイル**
- 主要テンプレート（ヒーロー画像の `priority`/`sizes`）
- 不要な `use client` の削減
- 大きな依存の `optimizePackageImports` 対象見直し

**目的**
- LCP/CLS の最終チューニングと初期JS削減

**作業項目**
- 重要画像の `sizes` 正確化・不要 CSS/JS の削減
- `lucide-react`/`date-fns` 等のパッケージ最適化
- `prefers-reduced-motion` 適用の確認

**検証**
- Lighthouse / Speed Insights のスコアが要件しきい値を満たす

**要件**
- R2, R6, R11, R12

---

## 変更ファイル一覧（サマリ）

```

.env.example                          (+)
next.config.ts                        (~)
src/lib/env.ts                        (+)
src/lib/schemas.ts                    (+/~)
src/lib/cms.ts                        (+/~)
src/lib/seo.ts                        (+)
src/app/layout.tsx                    (~)
src/app/globals.css                   (~)
src/app/opengraph-image.tsx           (+)
src/app/blog/[slug]/opengraph-image.tsx (+)
src/app/sitemap.ts                    (+)
src/app/robots.ts                     (+)
src/app/feed.xml/route.ts             (+)
src/app/blog/page.tsx                 (~)
src/app/blog/[slug]/page.tsx          (~)
src/app/not-found.tsx                 (+)
src/app/error.tsx                     (+)
src/app/contact/page.tsx              (~)
src/app/contact/ui/ContactForm.tsx    (+)
src/app/contact/send/route.ts         (+)
.github/workflows/ci.yml              (+/~)
.github/workflows/lighthouse.yml      (+)
lighthouserc.json                     (+)
tests/**                               (+)
README.md                              (~)

```

---

## リリース前チェックリスト（Definition of Done）

- [ ] CI（lint/typecheck/build/test/LHCI/a11y）がすべて**グリーン**
- [ ] Lighthouse CI しきい値達成：Perf ≥ 0.90 / A11y ≥ 0.95 / BP ≥ 0.90 / SEO ≥ 0.95
- [ ] 主要ページで “Loading …” が初期表示に出ない（SSR/SSG化）
- [ ] JSON-LD（WebSite/BlogPosting/Breadcrumb）を確認
- [ ] 画像 `alt`、`lang="ja"`、`aria-current`、フォームの `aria-*` が適用
- [ ] `sitemap.xml`/`robots.txt`/`feed.xml` が正しく配信
- [ ] Webhook 再検証が動作（手動検証ログあり）
- [ ] Turnstile 有効時に Bot 判定が機能
- [ ] CSP Report-Only で違反が解消、Enforce へ移行準備OK
- [ ] README のセットアップ/運用手順が最新

---
```
