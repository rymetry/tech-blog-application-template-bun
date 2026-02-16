Tech Blog Application Template (Next.js + microCMS)
==================================================

Next.js 15 / React 19 / Tailwind CSS v4 で構築した技術ブログ用テンプレートです。microCMS をヘッドレス CMS として採用し、記事一覧・検索・タグ絞り込み・関連記事・前後記事ナビゲーションなどブログ運用に必要な機能を備えています。App Router ベースで SEO とパフォーマンス最適化（ISR、メタデータ、構造化データ、RSS など）を実装済みです。

主な機能
--------

- microCMS 連携
  - 記事 / タグの取得を `src/lib/api.ts` に集約
  - アダプターで API スキーマをアプリ内型へマッピング
- ブログ UI
  - 最新記事カード（トップページ）
  - 記事一覧（検索、タグフィルタ、ページネーション）
  - 記事詳細（著者 / 公開・更新日 / タグ / 関連記事 / 前後記事ナビ）
  - お問い合わせフォーム、About ページ
- SEO と配信
  - `generateMetadata` / `Metadata` API を活用した title / description / canonical / OGP / Twitter カード
  - JSON-LD（Article / Breadcrumb / Blog）を自動出力
  - `truncateForSEO` でメタディスクリプション長を制御
  - `app/sitemap.ts` と `app/robots.ts` によるサイトマップ / robots.txt
  - `app/feed.xml/route.ts` で RSS 2.0 フィードを配信
  - `next/image` による OGP・本文画像の最適化
- Draft Mode プレビュー
  - microCMS プレビュー API と連携する `api/draft/enable|disable`
  - Draft Mode 有効時のバナー表示と `draftKey`/`contentId` 対応
- パフォーマンス
  - ISR（再生成間隔 300 秒）と Next.js fetch キャッシュを利用したデータ再検証
  - Draft Mode（`draftKey`/`contentId`）経路は `no-store` で常に最新を取得
  - フォールバック時の例外処理と `notFound` ハンドリング
- UI / スタイル
  - Tailwind CSS v4（Typography プラグイン）
  - shadcn/ui コンポーネント
  - `next-themes` によるダークモード
  - 日本語最適化フォント
    - **Noto Sans JP**（Google Fonts）: サイト全体（本文・見出し・UI）
    - **PlemolJP HS版**（ローカルフォント）: コードブロック専用
    - clamp() による流動的なフォントサイズでレスポンシブ対応
    - 日本語イタリック問題への対策済み
  - アクセシビリティ対応（Skip Link、ARIA 属性など）

技術スタック
------------

- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4 / `@tailwindcss/typography`
- microcms-js-sdk
- rss (RSS 2.0 フィード生成)
- shadcn/ui
- next-themes
- Bun / Node.js (任意のパッケージマネージャに対応)

ディレクトリ概要
----------------

- `src/app`
  - `page.tsx` トップページ
  - `articles/` 一覧・記事詳細ルート
  - `about` / `contact` / `not-found`
  - `layout.tsx` 共通レイアウト（メタデータ、テーマ、ヘッダー/フッター、GA、RSSリンク）
  - `api/draft/*` Draft Mode エンドポイント
  - `sitemap.ts` / `robots.ts` / `feed.xml/route.ts`
- `src/components` UI コンポーネント、ページ専用コンポーネント
- `src/lib`
  - `microcms.ts` microCMS クライアント
  - `api.ts` データ取得ラッパー
  - `metadata.ts` サイト定数と URL ユーティリティ
  - `metadata-helpers.ts` ページ/記事用メタデータ生成ヘルパー
  - `structured-data.ts` JSON-LD ユーティリティ
  - `utils.ts` 共通ヘルパー（`cn`, `formatDate`, `truncateForSEO`, `stripHtml` など）
- `src/types` ドメイン型定義
- `public` 静的アセット（プレースホルダー画像など）

セットアップ
------------

ルートに `.env.local` を作成し、最低限以下を設定します。

```env
MICROCMS_API_KEY=your-api-key
MICROCMS_ARTICLES=https://your-service.microcms.io/api/v1/articles
MICROCMS_TAGS=https://your-service.microcms.io/api/v1/tags

# サイトURL契約（推奨）
NEXT_PUBLIC_SITE_URL=https://example.com

# Optional: Vercel が production build/deploy 時に自動付与
# VERCEL_URL=your-project.vercel.app

MICROCMS_PREVIEW_SECRET=your-preview-secret
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX # GA4 を利用する場合のみ

# ローカル検証専用（CI / Vercel では禁止）
# ALLOW_LOCALHOST_SITE_URL_FOR_BUILD=1
```

- `MICROCMS_*` エンドポイント URL は API リスト画面からコピーしてください。
- プレビュー機能を使う場合は microCMS 側で Web プレビューに上記 `MICROCMS_PREVIEW_SECRET` と Draft Mode エンドポイントを設定します。
- `NEXT_PUBLIC_SITE_URL` を指定すると canonical / OGP / RSS URL が正しく生成されます。production で未設定の場合は `VERCEL_URL` を自動利用し、それも無い場合は fail-fast でビルドエラーになります。
- `SITE_URL` は非サポートです。設定しても利用されず、起動時にエラーになります。
- `ALLOW_LOCALHOST_SITE_URL_FOR_BUILD=1` はローカル検証専用です。`VERCEL=1` または truthy `CI`（`true|1|yes`）と併用すると fail-fast します。

任意のパッケージマネージャを利用できます。例として Bun:

```sh
bun install
```

その他:

```sh
npm install
# または
pnpm install
yarn install
```

開発サーバーを起動:

```sh
bun run dev
# もしくは
npm run dev
```

ブラウザで <http://localhost:3000> を開きます。

スクリプト
----------

- `bun run dev` / `npm run dev` 開発サーバー (Turbopack)
- `bun run lint` / `npm run lint` ESLint + 型チェック
- `bun run build` / `npm run build` 本番ビルド
- `bun test` / `npm test` テスト実行
- `bun run start` / `npm run start` 本番サーバー
- `bun run format` Prettier による整形（`.prettierrc` を参照）

コンテンツモデリングのヒント
----------------------------

- 記事コンテンツには `title`, `slug`, `excerpt`, `content`（リッチテキスト or HTML）, `ogpImage`, `tags`, `authors`, `relatedArticles` といったフィールドを想定しています。
- タグと著者は microCMS のリレーション機能で記事と紐付けます。
- OGP 画像は 1200x630 を推奨。未設定の場合はプレースホルダーが使用されます。

SEO / 配信設定
--------------

- `createPageMetadata` / `createArticleMetadata` でページ種別に応じたメタデータと OGP/Twitter カードを一元生成します。description は自動で 160 文字にトリミングされます。
- JSON-LD は `JsonLd` コンポーネント経由で出力。記事には `Article`、一覧には `BreadcrumbList` / `Blog` を付与。
- RSS フィード: `/feed.xml`（`layout.tsx` で `<link rel="alternate">` も登録済み）
- サイトマップ: `/sitemap.xml` は静的ページと記事を包含
- robots: `/robots.txt`
- 通常ページは ISR により 5 分間隔で再生成されます。
- Draft Mode プレビュー時は `no-store` で取得し、下書き内容を即時反映します。
- 本番環境では microCMS 取得失敗時に fail-fast で検知し、空データを静かに配信しない方針です。
- `next.config.ts` では `NEXT_PUBLIC_SITE_URL` の `env` 注入を行いません。環境変数はデプロイ先の設定値を直接参照します。

Draft Mode プレビュー
----------------------

microCMS でプレビュー用 URL に以下を設定:

```text
https://your-domain/api/draft/enable?secret=MICROCMS_PREVIEW_SECRET&contentId=...&draftKey=...&path=/articles/slug
```

上記リンクからアクセスすると Draft Mode が有効になり、最新の下書きデータでページが表示されます。画面右下のバナー（`DraftModeIndicator`）から `/api/draft/disable` を呼び出して終了できます。

品質管理
--------

- ESLint (flat config) + TypeScript による静的解析を `bun run lint` で実行
- 本番ビルド確認: `bun run build`
- RSS やサイトマップはビルド時に生成されるため、デプロイ前に実ファイルをブラウザ / バリデータで確認すると安心です。

トラブルシューティング
----------------------

- **microCMS のデータが取得できない**: 環境変数のエンドポイント URL や API Key が正しいか確認してください。
- **Prettier で `prettier-plugin-organize-imports` が見つからない**: `bun add -d prettier-plugin-organize-imports` で追加するか `.prettierrc` から plugins を削除してください。
- **Draft Mode が有効にならない**: `MICROCMS_PREVIEW_SECRET` と microCMS 側のプレビュー設定を再確認してください。

デプロイ
--------

- Vercel など標準的な Next.js デプロイフローに対応しています。
- 本番環境にも `.env.local` と同じ環境変数を設定してください。
- microCMS Webhook 連携による即時無効化（`revalidateTag` など）は必要に応じて追加実装してください。

ライセンス
----------

このテンプレートの利用条件はリポジトリのポリシーに従います。
