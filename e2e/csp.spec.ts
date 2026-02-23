import { test, expect } from '@playwright/test';

/**
 * CSP E2E テスト
 *
 * Content-Security-Policy ヘッダーの存在と、CSP 違反がないことを
 * 実ブラウザ上で検証する。nonce は使用せず unsafe-inline ベースの
 * ポリシーを採用しているため、ヘッダーのディレクティブ確認と
 * 違反ゼロの検証を行う。
 *
 * インフラ（Playwright が自動管理）:
 *   - globalSetup  → microCMS モック起動、.next 削除、ビルド、`next start` 起動
 *   - globalTeardown → サーバー停止、.next 削除
 *
 * 実行: bun run test:e2e
 */

test.describe('CSP policy', () => {
  test('CSP header is present with expected directives', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).toBeTruthy();

    const csp =
      response!.headers()['content-security-policy'] ||
      response!.headers()['content-security-policy-report-only'];
    expect(csp).toBeTruthy();

    // 主要ディレクティブの存在を確認する。
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain('report-uri /api/csp-report');
  });

  test('JSON-LD script has valid structured data', async ({ page }) => {
    await page.goto('/');

    // JSON-LD がパース可能な構造化データであることを検証する。
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    expect(jsonLdScripts.length).toBeGreaterThanOrEqual(1);

    const content = await jsonLdScripts[0].innerHTML();
    const parsed = JSON.parse(content);
    expect(parsed['@context']).toBe('https://schema.org');
  });

  test('no CSP violations reported on page load', async ({ page }) => {
    const cspErrors: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (
        msg.type() === 'error' &&
        (text.toLowerCase().includes('content security policy') ||
          text.toLowerCase().includes('refused to'))
      ) {
        cspErrors.push(text);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(cspErrors).toHaveLength(0);
  });

  test('multiple pages load without CSP violations', async ({ page }) => {
    const cspErrors: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (
        msg.type() === 'error' &&
        (text.toLowerCase().includes('content security policy') ||
          text.toLowerCase().includes('refused to'))
      ) {
        cspErrors.push(text);
      }
    });

    // /, /articles, /projects を順番に確認する。
    for (const path of ['/', '/articles', '/projects']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }

    expect(cspErrors).toHaveLength(0);
  });
});
