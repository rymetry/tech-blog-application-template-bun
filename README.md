Tech Blog Application Template (Next.js + microCMS)

このリポジトリは、Next.js 15 / React 19 / Tailwind CSS v4 を使った技術ブログ用テンプレートです。microCMS と連携して記事・タグ・著者情報を取得し、一覧/検索/タグ絞り込み/ページネーション/記事詳細（関連記事・前後記事）を提供します。

主なスタック
- Next.js 15（App Router）
- React 19
- Tailwind CSS v4（`@tailwindcss/postcss` + Typography プラグイン）
- microcms-js-sdk
- shadcn/ui（`components.json` 管理）
- next-themes（ダークモード）

プロジェクト構成（抜粋）
- `src/app`：トップ/ブログ/詳細/アバウト/コンタクト等のルート、共通 `layout.tsx`
- `src/components`：UI パーツ（カード、ボタン等）とページ用コンポーネント
- `src/lib`：API ラッパー・microCMS クライアント・ユーティリティ
- `src/types`：アプリ内部で使う型
- `public`：静的アセット

必要要件
- Node.js 18+（または Bun）
- パッケージマネージャ（npm / pnpm / yarn / bun のいずれか）
- microCMS のサービス（Service Domain と API Key）

セットアップ
1) 依存関係のインストール
   - npm: `npm install`
   - pnpm: `pnpm install`
   - yarn: `yarn install`
   - bun: `bun install`

2) 環境変数の設定（必須）
   ルートに `.env.local` を作成し、以下を設定してください：

   ```env
   MICROCMS_SERVICE_DOMAIN=your-service-domain
   MICROCMS_API_KEY=your-api-key
   ```

   補足: `src/lib/microcms.ts` で未設定時に警告を出します。画像の最適化は `next.config.ts` で `images.microcms-assets.io` を許可しています。

3) 開発サーバの起動

   ```bash
   npm run dev
   # または
   pnpm dev
   yarn dev
   bun dev
   ```

   ブラウザで http://localhost:3000 を開きます。

ビルドと実行
- ビルド: `npm run build`
- 本番起動: `npm run start`

スクリプト一覧（`package.json`）
- `dev`: `next dev --turbopack`
- `build`: `next build`
- `start`: `next start`
- `lint`: `next lint`
- `format`: `prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"`

Lint / Format
- ESLint: Flat config（`eslint.config.mjs`）。`next/core-web-vitals` と `next/typescript`、`prettier` を拡張
- Prettier: ルートの `.prettierrc` を参照
  - 既定で `"plugins": ["prettier-plugin-organize-imports"]` を指定しています
  - プラグイン未インストールの場合、次のいずれかで対処してください
    - インストール: `npm i -D prettier-plugin-organize-imports`（または `bun add -d prettier-plugin-organize-imports` など）
    - 使わない: `.prettierrc` の `plugins` エントリを削除

microCMS 連携について
- API クライアントは `src/lib/microcms.ts`。
- データ取得は `src/lib/api.ts` が窓口で、`adapters.ts` でアプリ内部向けの型に整形しています。
- 記事一覧: `getBlogPosts`
- 記事詳細: `getBlogPost`（関連記事や著者等を含むため `depth` を利用）
- タグ一覧: `getTags`

UI / スタイル
- Tailwind CSS v4 を使用（`src/app/globals.css` に `@tailwind` と `@plugin "@tailwindcss/typography"` を記述）
- shadcn/ui の設定は `components.json` を参照
- ダークモードは `next-themes`（`ThemeProvider`）で制御

主な機能
- トップページに最新記事（3件）の表示
- ブログ一覧（検索、タグフィルタ、ページネーション対応）
- 記事詳細（著者・公開/更新日・タグ・関連記事・前後記事ナビ）
- アクセシビリティ考慮（キーボードフォーカス/aria 属性など）
- 画像最適化（`next/image`）

トラブルシューティング
- Prettier 実行時に `Cannot find package 'prettier-plugin-organize-imports'` が出る
  - 対応: 上記の通りプラグインをインストールするか `.prettierrc` の plugins 設定を削除してください
- microCMS にデータがない/スキーマが異なる
  - 画面に「No posts available」等が表示されます。スキーマが異なる場合は `src/lib/adapters.ts` を調整してください

デプロイ
- 一般的な Next.js の手順に従います（Vercel 推奨）
- 環境変数（`MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`）をデプロイ環境にも設定してください

ライセンス
- このテンプレートのライセンス/利用規約はリポジトリのポリシーに従います
