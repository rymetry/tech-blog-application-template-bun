import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.CSP_E2E_PORT || 3210);

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: 'list',

  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // デフォルトはヘッドレス。HEADED=1 でブラウザ表示デバッグ可能。
    headless: !process.env.HEADED,
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
