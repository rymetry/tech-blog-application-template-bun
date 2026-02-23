import type { Server } from 'node:http';
import type { ChildProcess } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const PROJECT_ROOT = process.cwd();
const NEXT_DIR = resolve(PROJECT_ROOT, '.next');

/**
 * Playwright globalTeardown — 全テストファイルの実行後に呼ばれる。
 *
 * 1. Next.js 本番サーバーを停止。
 * 2. microCMS モックサーバーをシャットダウン。
 * 3. E2E 用 `.next` ビルド出力を削除。
 */
export default async function globalTeardown() {
  // ---- Next.js 停止 ----
  const nextServer = (globalThis as Record<string, unknown>)
    .__nextServer as ChildProcess | undefined;

  if (nextServer) {
    nextServer.kill('SIGTERM');
    await Promise.race([
      new Promise<void>((r) => nextServer.once('exit', () => r())),
      delay(5_000).then(() => nextServer.kill('SIGKILL')),
    ]);
    console.log('[e2e] Next.js server stopped.');
  }

  // ---- microCMS モック停止 ----
  const mockServer = (globalThis as Record<string, unknown>)
    .__mockMicroCmsServer as Server | undefined;

  if (mockServer) {
    await new Promise<void>((resolve) => {
      mockServer.close(() => resolve());
    });
    console.log('[e2e] Mock microCMS server stopped.');
  }

  // ---- .next クリーンアップ（E2E ビルド出力） ----
  if (existsSync(NEXT_DIR)) {
    rmSync(NEXT_DIR, { recursive: true, force: true });
    console.log('[e2e] Cleaned .next directory');
  }
}
