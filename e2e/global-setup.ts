import { createServer, type Server } from 'node:http';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const MOCK_MICROCMS_PORT = Number(process.env.CSP_E2E_MICROCMS_PORT || 4210);
const MOCK_MICROCMS_ORIGIN = `http://127.0.0.1:${MOCK_MICROCMS_PORT}`;

const APP_PORT = Number(process.env.CSP_E2E_PORT || 3210);
const APP_ORIGIN = `http://127.0.0.1:${APP_PORT}`;
const STARTUP_TIMEOUT_MS = 45_000;
const POLL_INTERVAL_MS = 500;

const PROJECT_ROOT = process.cwd();
const NEXT_DIR = resolve(PROJECT_ROOT, '.next');

/**
 * ビルド / 起動用の子プロセスに渡す環境変数。
 * Next.js の `@next/env`（dotenv）は `process.env` に既に存在する
 * 値を上書きしないため、ここで指定した値がディスク上の `.env` より
 * 優先される。ファイルの差し替えは不要。
 */
const buildEnv: NodeJS.ProcessEnv = {
  ...process.env,
  NODE_ENV: 'production',
  MICROCMS_API_KEY: process.env.MICROCMS_API_KEY || 'test-api-key',
  MICROCMS_ARTICLES: `${MOCK_MICROCMS_ORIGIN}/articles`,
  MICROCMS_TAGS: `${MOCK_MICROCMS_ORIGIN}/tags`,
  MICROCMS_PREVIEW_SECRET:
    process.env.MICROCMS_PREVIEW_SECRET || 'test-preview-secret',
  NEXT_PUBLIC_GA_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-TESTTEST01',
  NEXT_PUBLIC_SITE_URL: 'https://example.com',
};

/**
 * microCMS の Article スキーマを満たす最小限の記事スタブ。
 * E2E テストが記事詳細ページを検証するために使用する。
 */
const STUB_ARTICLE = {
  id: 'e2e-stub',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  publishedAt: '2025-01-01T00:00:00.000Z',
  revisedAt: '2025-01-01T00:00:00.000Z',
  title: 'E2E Stub Article',
  slug: 'e2e-stub',
  excerpt: 'Stub article for E2E tests.',
  content: { body: '<p>Stub</p>' },
};

/**
 * 最小限の microCMS モックサーバーを起動する。
 * /articles にはスタブ記事 1件、/tags には空リストを返す。
 */
function startMockMicroCmsServer(): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const requestUrl = new URL(
        req.url || '/',
        MOCK_MICROCMS_ORIGIN,
      );
      const pathname = requestUrl.pathname;

      const makeListResponse = (
        contents: unknown[] = [],
      ) => {
        const limit = Number(
          requestUrl.searchParams.get('limit') || 10,
        );
        const offset = Number(
          requestUrl.searchParams.get('offset') || 0,
        );
        return {
          contents,
          totalCount: contents.length,
          offset,
          limit,
        };
      };

      if (pathname === '/articles') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(makeListResponse([STUB_ARTICLE])));
        return;
      }

      if (pathname === '/tags') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(makeListResponse()));
        return;
      }

      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not Found' }));
    });

    server.once('error', reject);
    server.listen(MOCK_MICROCMS_PORT, '127.0.0.1', () => resolve(server));
  });
}

/**
 * シェルコマンドを実行し、正常終了を待つ。
 */
function runCommand(
  command: string,
  args: string[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: PROJECT_ROOT,
      env: buildEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `${command} ${args.join(' ')} failed (code ${code})\n${stdout}\n${stderr}`,
        ),
      );
    });
  });
}

/**
 * Next.js 本番サーバーが 200 を返すまでポーリングする。
 */
async function waitForServerReady(): Promise<void> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
    try {
      const res = await fetch(`${APP_ORIGIN}/`, {
        headers: { Accept: 'text/html' },
      });
      if (res.ok) return;
    } catch {
      // サーバー起動前の接続失敗 — リトライ
    }
    await delay(POLL_INTERVAL_MS);
  }
  throw new Error(
    `Timed out waiting for Next.js on ${APP_ORIGIN} (${STARTUP_TIMEOUT_MS}ms)`,
  );
}

/**
 * Playwright globalSetup — 全テストファイルの実行前に呼ばれる。
 *
 * 1. microCMS モックサーバーを起動（スタブ記事 + 空タグ）。
 * 2. `.next` を削除してクリーンビルドを保証。
 * 3. E2E 用環境変数を `spawn({ env })` 経由で渡し `next build` を実行。
 * 4. `next start` を起動し、応答可能になるまで待機。
 *
 * `globalTeardown` でサーバー停止とビルド出力のクリーンアップを行う。
 */
export default async function globalSetup() {
  // ---- microCMS モック起動 ----
  console.log('[e2e] Starting mock microCMS server …');
  const server = await startMockMicroCmsServer();
  (globalThis as Record<string, unknown>).__mockMicroCmsServer = server;
  console.log(`[e2e] Mock microCMS listening on ${MOCK_MICROCMS_ORIGIN}`);

  // ---- .next クリーンアップ ----
  if (existsSync(NEXT_DIR)) {
    rmSync(NEXT_DIR, { recursive: true, force: true });
    console.log('[e2e] Cleaned .next directory');
  }

  // ---- ビルド ----
  console.log('[e2e] Building Next.js (production) …');
  await runCommand('bun', ['run', 'build']);
  console.log('[e2e] Build complete.');

  // ---- Next.js 起動 ----
  console.log(`[e2e] Starting Next.js on port ${APP_PORT} …`);
  const nextServer = spawn(
    'bun',
    ['run', 'start', '--', '-p', String(APP_PORT)],
    { cwd: PROJECT_ROOT, env: buildEnv, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  (globalThis as Record<string, unknown>).__nextServer = nextServer;

  await waitForServerReady();
  console.log(`[e2e] Next.js ready on ${APP_ORIGIN}`);
}
