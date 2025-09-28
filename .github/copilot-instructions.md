# AIエージェント オンボーディング

## 使用言語
- 日本語

## プロジェクト概要
- Next.js 15 App RouterとRSCを使用；ルートファイルは`src/app`にあり、クライアントコンポーネントは`'use client'`でオプトイン。
- 状態とモデルはTypeScriptで型付け；共有の型定義は`src/types/index.ts`に配置。
- コンテンツはmicroCMSから`src/lib/microcms.ts`を通して取得し、`src/lib/adapters.ts`と`src/lib/api.ts`を経てコンポーネントに流れる。
- `src/components`にはページレベルの複合コンポーネントとshadcnベースのUIプリミティブが`src/components/ui/*`に配置。

## 環境と設定
- `src/lib/env.ts`は現在`MICROCMS_SERVICE_DOMAIN`と`MICROCMS_API_KEY`のみを検証；新しい変数を読み込む前にここに追加すること。
- `.env.example`に必要なキーをリスト；設計ドキュメントでは追加のシークレットに言及しているが、まだ配線されていない—存在すると仮定する前に確認すること。
- リモート画像は`next.config.ts`の`images.remotePatterns`でホワイトリスト化；新しいアセットはそれらのドメイン下に保持するか、意図的にリストを拡張すること。

## スタイリングとテーマ
- Tailwind CSS v4は`src/app/globals.css`で`@import "tailwindcss"`と`@theme`を使用して完全に設定；`tailwind.config.js`は存在しない。
- レイアウトフォントは`src/app/layout.tsx`で`next/font`（`Inter`、`Noto_Sans_JP`）を使用；既存のCSS変数`--font-sans`と`--font-ui`を再利用すること。
- ライト/ダークモードは`ThemeProvider`（`src/components/theme-provider.tsx`）と`ModeToggle`ドロップダウンで処理；色をハードコーディングする代わりにCSSトークンを尊重すること。
- スタイリングにはshadcnプリミティブ（`src/components/ui`）と`cn`ヘルパーを優先；これらには既にフォーカスリングとaria初期設定が含まれている。

## データとレンダリング規約
- `src/lib/api.ts`の`getBlogPosts`は`{ contents, totalCount, offset, limit }`を返し、`BlogPostsList`を駆動；API拡張時はこの契約を維持すること。
- タグフィルターは`tags[contains]${tagId}`のようなmicroCMS文字列を構築；`/blog?tag=...`にリンクする際は常にタグIDを使用すること。
- ブログカードは`/blog/${post.id}`にリンク（詳細ページはmicroCMS IDでポストを解決する`src/app/blog/[id]/page.tsx`）；他の場所でスラッグを追加してもIDを保持すること。
- `PrevNextPosts`（`src/components/prev-next-posts.tsx`）は最初の100投稿を取得して隣接を派生；ソート順やページネーションサイズを変更する場合は調整すること。
- 非同期UIはSuspenseフォールバックでラップ；クライアント専用ローダーを導入する代わりに、このパターンに適合するサーバーコンポーネントを優先すること。
- `adaptBlog`（`src/lib/adapters.ts`）は`custom_body`に`related_blogs`が含まれると仮定；CMSスキーマが進化する際はそのマッピングを同期すること。

## メディア処理
- リモート画像には`FallbackImage`（`src/components/fallback-image.tsx`）を使用し、失敗時に`/placeholder.svg`に優雅にスワップされるようにすること。
- フォールド上の画像（ホームヒーロー、ブログカバー）は`priority`と明示的な`sizes`でLCPアセットをマーク；新しいヒーローセクションでもこのパターンに従うこと。

## ページとルーティング注意事項
- Next 15は`params`と`searchParams`を`Promise`として渡す；`src/app/blog/page.tsx`と`src/app/blog/[id]/page.tsx`のように`await`で解決すること。
- コンタクトページ（`src/app/contact/page.tsx`）はまだクライアントサイドで送信をシミュレート；実際のAPIを接続する前に`src/app/contact`下にルートハンドラーを追加すること。
- アクセシビリティヘルパー—スキップリンク、フォーカススタイル、motion-reducedルール—は`src/app/layout.tsx`と`globals.css`に集約；レイアウト調整時も完全に保持すること。

## ローカルワークフロー
- 標準フロー：`bun install`、ローカル用に`bun dev`、検証用に`bun run build`、コミット前に`bun run lint` / `bun run typecheck`。
- `bun test`は存在するがまだテストスイートは同梱されていない；カバレッジを追加する場合は`tests/**`下にBun互換テストを書くこと。
- Playwrightは`bunx playwright test`で利用可能；依存関係インストール後に`bunx playwright install --with-deps`を実行すること。
- フォーマットは`prettier-plugin-organize-imports`付きの`.prettierrc`を使用；プラグインをインストールしたままにするか、`bun run format`実行前に削除すること。

## ドキュメントとの照合
- `docs/design.md`と`docs/requirements.md`は将来の機能強化（ネイティブfetch、ISR、CSP、コンタクトAPI）を概説；これらの設計図に従う前に実際のコードパスを確認すること。
