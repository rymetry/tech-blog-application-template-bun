import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = Number(process.env.CSP_E2E_PORT || 3210);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const MOCK_MICROCMS_PORT = Number(process.env.CSP_E2E_MICROCMS_PORT || 4210);
const MOCK_MICROCMS_ORIGIN = `http://127.0.0.1:${MOCK_MICROCMS_PORT}`;
const STARTUP_TIMEOUT_MS = 45_000;
const POLL_INTERVAL_MS = 500;
const GA_TEST_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-TESTTEST01';

const buildEnv = {
  ...process.env,
  NODE_ENV: 'production',
  NEXT_PUBLIC_GA_MEASUREMENT_ID: GA_TEST_MEASUREMENT_ID,
  CSP_NONCE_E2E_PROBE: '1',
  NEXT_PUBLIC_SITE_URL: 'https://example.com',
  MICROCMS_API_KEY: process.env.MICROCMS_API_KEY || 'test-api-key',
  MICROCMS_ARTICLES: `${MOCK_MICROCMS_ORIGIN}/articles`,
  MICROCMS_TAGS: `${MOCK_MICROCMS_ORIGIN}/tags`,
  MICROCMS_PREVIEW_SECRET: process.env.MICROCMS_PREVIEW_SECRET || 'test-preview-secret',
};

const runCommand = (command, args, env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} failed with code ${code}\n${stdout}\n${stderr}`));
    });
  });

const startMockMicroCmsServer = async () => {
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url || '/', MOCK_MICROCMS_ORIGIN);
    const pathname = requestUrl.pathname;

    const makeListResponse = () => {
      const limit = Number(requestUrl.searchParams.get('limit') || 10);
      const offset = Number(requestUrl.searchParams.get('offset') || 0);
      return {
        contents: [],
        totalCount: 0,
        offset,
        limit,
      };
    };

    if (pathname === '/articles' || pathname === '/tags') {
      response.statusCode = 200;
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify(makeListResponse()));
      return;
    }

    response.statusCode = 404;
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ message: 'Not Found' }));
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(MOCK_MICROCMS_PORT, '127.0.0.1', resolve);
  });

  return server;
};

const waitForServerReady = async () => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
    try {
      const response = await fetch(`${ORIGIN}/`, {
        headers: {
          Accept: 'text/html',
        },
      });
      if (response.ok) {
        return;
      }
    } catch {
      // サーバー起動前の接続失敗は待機して再試行する。
    }

    await delay(POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for next start on ${ORIGIN}`);
};

const extractNonceFromCsp = (headerValue) => {
  const match = headerValue.match(/script-src[^;]*'nonce-([^']+)'/i);
  if (!match?.[1]) {
    throw new Error('CSP header does not include script-src nonce.');
  }
  return match[1];
};

const getAttribute = (attributes, name) => {
  const match = attributes.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'));
  return match?.[1] || null;
};

const extractScriptNonce = (html, predicate) => {
  const scriptTagPattern = /<script\b([^>]*)>/gi;
  let match = scriptTagPattern.exec(html);

  while (match) {
    const attrs = match[1] || '';
    if (predicate(attrs)) {
      const nonce = getAttribute(attrs, 'nonce');
      if (!nonce) {
        throw new Error('Matched script tag is missing nonce attribute.');
      }
      return nonce;
    }
    match = scriptTagPattern.exec(html);
  }

  return null;
};

const main = async () => {
  const microCmsServer = await startMockMicroCmsServer();
  let server = null;
  let stderr = '';

  try {
    await runCommand('bun', ['run', 'build'], buildEnv);

    server = spawn('bun', ['run', 'start', '--', '-p', String(PORT)], {
      env: buildEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    server.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    await waitForServerReady();

    const response = await fetch(`${ORIGIN}/`, {
      headers: {
        Accept: 'text/html',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch /: status=${response.status}`);
    }

    const cspHeader =
      response.headers.get('content-security-policy') ||
      response.headers.get('content-security-policy-report-only');
    if (!cspHeader) {
      throw new Error('CSP header was not found on HTML response.');
    }

    const cspNonce = extractNonceFromCsp(cspHeader);
    const html = await response.text();

    const layoutNonce = extractScriptNonce(
      html,
      (attrs) => /\bid=["']layout-csp-probe["']/i.test(attrs),
    );
    if (!layoutNonce) {
      throw new Error('Layout CSP probe script was not found on /.');
    }

    const jsonLdNonce = extractScriptNonce(
      html,
      (attrs) => /\btype=["']application\/ld\+json["']/i.test(attrs),
    );
    if (!jsonLdNonce) {
      throw new Error('JSON-LD script was not found on /.');
    }

    if (layoutNonce !== cspNonce) {
      throw new Error('Nonce mismatch: CSP header and Layout probe script nonce differ.');
    }
    if (jsonLdNonce !== cspNonce) {
      throw new Error('Nonce mismatch: CSP header and JsonLd script nonce differ.');
    }

    console.log('CSP nonce smoke test passed.');
  } finally {
    if (server) {
      server.kill('SIGTERM');
      await Promise.race([
        new Promise((resolve) => server.once('exit', resolve)),
        delay(5_000).then(() => {
          server.kill('SIGKILL');
        }),
      ]);
    }
    await new Promise((resolve) => {
      microCmsServer.close(() => resolve(undefined));
    });
    if (stderr.trim()) {
      process.stderr.write(stderr);
    }
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
