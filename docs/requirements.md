# Requirements Document

## Introduction

本機能は既存の Tech Blog アプリケーションを**本番運用レベル**に高めるための改善要件をまとめたものです。対象は SEO 最適化、セキュリティ強化、パフォーマンス向上、運用信頼性の確保です。具体的には、環境変数の標準化、画像最適化、テーマ管理、コンテンツ配信最適化、問い合わせフォームの実装、アクセシビリティ強化、分析・監視、CI/CD 導入を含みます。

---

## Requirements

### Requirement 1: 環境変数設定の標準化（Environment Configuration Standardization）

**User Story:**
開発者として、環境変数が標準化されていて各環境に正しくデプロイできるようにしたい。

**Acceptance Criteria**
1. アプリ起動時に `.env.local` から環境変数を読み込めること。
2. 必須の環境変数が欠けている場合、どの変数が不足しているか**明確なエラーメッセージ**を表示すること。
3. 本番デプロイ時に `NEXT_PUBLIC_BASE_URL`、`REVALIDATE_SECRET`、Resend 用 API キー、Turnstile 設定をサポートすること。
4. `.env.example` を用意し、**必要な全変数のテンプレート**と例値が含まれていること。

---

### Requirement 2: 画像最適化とセキュリティ（Image Optimization and Security）

**User Story:**
コンテンツ制作者として、microCMS からの画像が最適に読み込まれ、ユーザー体験が良くなるようにしたい。

**Acceptance Criteria**
1. 表示画像に対して適切な `sizes` と、LCP 対象には `priority` を設定すること。
2. 許可する画像ドメインを**信頼済みの microCMS ドメインのみに限定**すること。
3. 画像が読み込めない場合に**視覚的フォールバック**を表示すること。
4. 装飾目的でない画像には**意味のある `alt` テキスト**を提供すること。

---

### Requirement 3: テーマ管理（Theme Management System）

**User Story:**
ユーザーとして、ライト/ダークテーマを切り替え、好みの見た目で読めるようにしたい。

**Acceptance Criteria**
1. サイト訪問時、**システムのテーマ設定**を検出して初期テーマを適用すること。
2. テーマトグルクリックでライト/ダークを切り替えられること。
3. ユーザーのテーマ選好を**セッションをまたいで保持**すること。
4. 初回描画時の**テーマフラッシュを防止**するため、適切にハイドレーションを扱うこと。

---

### Requirement 4: SEO と発見性（SEO and Content Discovery）

**User Story:**
コンテンツが検索・SNS で適切に見つかり、魅力的にシェアされるようにしたい。

**Acceptance Criteria**
1. 各ページで適切な **meta / Open Graph / Twitter Card** を生成すること。
2. 検索エンジンに対して **`sitemap.xml`** を提供し、全記事・主要ページを含めること。
3. **`/feed.xml`** で有効な RSS を配信すること。
4. 記事シェア時に**動的 OGP 画像**（タイトル等を含む）を生成すること。
5. **`robots.txt`** を適切に返却すること。
6. ルート・記事・パンくず等に **JSON-LD 構造化データ**（`WebSite` / `BlogPosting` / `BreadcrumbList`）を埋め込むこと。
7. すべてのページで**カノニカル URL** を一貫して設定し、重複コンテンツを回避すること。

---

### Requirement 5: コンテンツ取得とキャッシュ（Content Management and Caching）

**User Story:**
開発者として、信頼できるフェッチと適切なキャッシュで高速かつ堅牢に動作してほしい。

**Acceptance Criteria**
1. microCMS からの取得に **ネイティブ `fetch`** を用い、Next.js の **再検証（`revalidate`）と `tags`** を活用すること。
2. microCMS 更新時に **Webhook ベースの再検証** をサポートすること。
3. API 応答は **Zod スキーマで検証**すること。
4. API 失敗時は**優雅なフォールバック**を提供し、UX を阻害しないこと。
5. キャッシュは**適切なタグ**で付与し、**選択的無効化**を可能にすること。

---

### Requirement 6: 静的サイト生成最適化（Static Site Generation Optimization）

**User Story:**
ユーザーとして、ページがすばやく表示されることを望む。

**Acceptance Criteria**
1. ビルド時に **`generateStaticParams`** で**全記事ページを事前生成**すること。
2. 訪問時は**静的生成されたコンテンツ**を提供すること（ISR を含む）。
3. ブログ一覧は**初期コンテンツをサーバーで描画**すること。
4. 検索・フィルタは**URL 状態を維持**し、ブックマーク/共有可能にすること。
5. **Above-the-fold** の初期ビューでは**クライアント側の “Loading …” を表示しない**（SSR/SSG で HTML を返す）。
6. **フォントは `next/font`**（可変・サブセット・自動プリロード）を用い、**CLS を最小化**すること。

---

### Requirement 7: 問い合わせフォーム実装（Contact Form Implementation）

**User Story:**
訪問者として、安全に問い合わせできるフォームが欲しい。

**Acceptance Criteria**
1. 送信時の入力を **Zod** で検証すること。
2. 検証成功時は **Resend API** でメールを送信すること。
3. Bot 対策として **Turnstile** を検証すること（有効時）。
4. 送信完了/失敗時に**明確なフィードバック**を表示すること。
5. 失敗時は**アクセシビリティ対応**（`aria-live` 等）でエラーを明示すること。

---

### Requirement 8: セキュリティヘッダと保護（Security Headers and Protection）

**User Story:**
管理者として、一般的な脆弱性から保護されたアプリにしたい。

**Acceptance Criteria**
1. 配信時に **X-Frame-Options / X-Content-Type-Options / Referrer-Policy** を含めること。
2. **Permissions-Policy** を設定し、不要なブラウザ機能を制限すること。
3. **CSP** は **Report-Only → Enforce** の段階導入をサポートすること。
4. セキュリティヘッダの導入で既存機能を破壊しないこと。
5. CSP 施行時は **`frame-ancestors`** を使用し、必要に応じて X-Frame-Options を併用すること。

---

### Requirement 9: アクセシビリティと UX（Accessibility and User Experience）

**User Story:**
支援技術利用者として、快適に利用できるブログであってほしい。

**Acceptance Criteria**
1. キーボードユーザーのため **スキップリンク** を提供すること。
2. フォーカス時に**明確なフォーカスインジケータ**を表示すること。
3. フォームで **ARIA ラベル** と **`aria-live`** による状態更新を提供すること。
4. **`prefers-reduced-motion`** を尊重すること。
5. **セマンティック HTML** と正しい見出し階層を用いること。
6. ドキュメントには **`<html lang="ja">`**（もしくは適正ロケール）を設定すること。
7. 現在ページのナビゲーションには **`aria-current="page"`** を付与すること。

---

### Requirement 10: 検索とフィルタ（Blog Search and Filtering）

**User Story:**
読者として、関心のある記事をすばやく見つけたい。

**Acceptance Criteria**
1. 検索入力は**デバウンス**して結果を更新すること。
2. タグ選択で **URL を更新**し、絞り込み結果を表示すること。
3. ページネーション時も**検索・フィルタ状態を維持**すること。
4. 結果が空のとき、**適切なメッセージ**を表示すること。
5. URL パラメータの変更に応じて**ページ内容を同期**すること。
6. microCMS の **`totalCount`** を用いてページ数/`hasMore` を**正確に算出**すること。

---

### Requirement 11: パフォーマンス監視と分析（Performance Monitoring and Analytics）

**User Story:**
開発者として、サイトのパフォーマンスを継続的に把握・改善したい。

**Acceptance Criteria**
1. **Vercel Analytics** を導入して利用状況を追跡すること。
2. **Speed Insights** を組み込み、Core Web Vitals を監視すること。
3. 分析コードは**ユーザー体験を阻害しない**こと。
4. 分析が失敗してもアプリは**正常動作**を続けること。
5. 可能な範囲で **Do Not Track（DNT）等のプライバシーシグナル**に配慮し、PII を収集しないこと。

---

### Requirement 12: CI/CD と品質保証（CI/CD Pipeline and Quality Assurance）

**User Story:**
開発者として、自動品質チェックで変更の安全性を担保したい。

**Acceptance Criteria**
1. Push 時に **lint / typecheck / build** を実行すること。
2. Pull Request 作成時に**全品質チェックを自動実行**すること。
3. **Lighthouse CI** を構成し、以下の**しきい値**を満たすこと：
   - Performance ≥ **0.90** / Accessibility ≥ **0.95** / Best-Practices ≥ **0.90** / SEO ≥ **0.95**
4. しきい値未達やチェック失敗時は**デプロイをブロック**し、明確なエラー情報を提供すること。
5. 成功時は**デプロイ可能アーティファクト**を提供すること。

---

### Requirement 13: エラー/NotFound ハンドリング（Error/NotFound Handling）

**User Story:**
ユーザーとして、エラー時にも状況が分かり復帰しやすい体験が欲しい。

**Acceptance Criteria**
1. 該当ページが無い場合、**フレンドリーな 404 ページ**を表示し、遷移手段を提示すること。
2. 予期せぬエラー時、**ユーザーフレンドリーなエラーページ**を表示し、サーバ側で詳細を構造化ログ出力すること。
3. CMS コンテンツ未検出時は**適切に 404** を返し、汎用エラーでごまかさないこと。

---
