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
- Node.js 18+（または Bun 1.1+ 推奨）
- パッケージマネージャ（npm / pnpm / yarn / bun のいずれか）
- microCMS のサービス（Service Domain と API Key）

セットアップ
1) 依存関係のインストール
   - npm: `npm install`
   - pnpm: `pnpm install`
   - yarn: `yarn install`
   - bun: `bun install`
   - Playwright（ブラウザ依存の取得）: `bunx playwright install --with-deps`

2) 環境変数の設定（必須）
   `.env.example` を `.env.local` にコピーし、環境に合わせて値を更新します：

   ```bash
   cp .env.example .env.local
   ```

   設定するキーは以下のとおりです（★は必須）：
   - ★ `NEXT_PUBLIC_BASE_URL`：サイトの公開 URL（例: `http://localhost:3000`）
   - ★ `MICROCMS_SERVICE_DOMAIN`：microCMS のサービスドメイン
   - ★ `MICROCMS_API_KEY`：microCMS の API キー
   - ★ `REVALIDATE_SECRET`：Webhook などで利用する再検証用シークレット（十分な長さのランダム文字列を推奨）
   - `RESEND_API_KEY`：問い合わせメール送信に利用（未使用なら空のままで可）
   - `CONTACT_TO`：問い合わせメールを受け取る宛先アドレス
   - `TURNSTILE_SECRET_KEY`：Cloudflare Turnstile を利用する場合のシークレットキー

   編集後に `bun run build` を実行すると、必須キーが欠けている場合は `src/lib/env.ts` が明示的なエラーメッセージを表示して処理を中断します。

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
- `lint`: `eslint .`
- `format`: `prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"`
- `typecheck`: `tsc -p tsconfig.json --noEmit`
- `test`: `bun test`
- `e2e`: `bunx playwright test`
- `a11y`: `bunx playwright test -g "a11y"`

Lint / Format
- ESLint: Flat config（`eslint.config.mjs`）。`next/core-web-vitals` と `next/typescript`、`prettier` を拡張
- Prettier: ルートの `.prettierrc` を参照
  - 既定で `"plugins": ["prettier-plugin-organize-imports"]` を指定しています
  - プラグイン未インストールの場合、次のいずれかで対処してください
    - インストール: `npm i -D prettier-plugin-organize-imports`（または `bun add -d prettier-plugin-organize-imports` など）
    - 使わない: `.prettierrc` の `plugins` エントリを削除

microCMS 連携について
- API クライアントは `src/lib/cms.ts`（native `fetch` + `revalidate/tags`）。
- データ取得は同モジュール経由で、`adapters.ts` でアプリ内部向けの型に整形しています。
- 記事一覧: `getPosts`
- 記事詳細: `getPostById`
- タグ一覧: `getTags`
- microCMS の Webhook で `/api/revalidate` を叩き、配信中サイトのキャッシュを更新できます（`x-revalidate-secret` ヘッダーに `REVALIDATE_SECRET` を設定）。
  - Webhook 設定例（microCMS 管理画面）
    1. 対象サービスの「API 設定」→「Webhook」を開く
    2. URL に `https://<YOUR_DOMAIN>/api/revalidate` を指定
    3. HTTP Method は `POST`
    4. HTTP Header に `x-revalidate-secret: <REVALIDATE_SECRET>` を追加
    5. 監視イベント（公開・更新・削除など）を有効化して保存
  - 手動検証用 cURL 例

    ```bash
    curl -X POST \
      -H "x-revalidate-secret: $REVALIDATE_SECRET" \
      https://your-domain.example.com/api/revalidate
    ```

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
- 環境変数（`NEXT_PUBLIC_BASE_URL`, `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`, `REVALIDATE_SECRET` など必要なキー）をデプロイ環境にも設定してください

ライセンス
- このテンプレートのライセンス/利用規約はリポジトリのポリシーに従います
