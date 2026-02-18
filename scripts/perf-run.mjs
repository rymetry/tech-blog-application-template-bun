#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_BASE_URL = 'https://tech-blog-application-template-bun.vercel.app';
const DEFAULT_MODE = 'core';
const DEFAULT_DEVICE = 'mobile';
const CORE_PATHS = ['/', '/projects', '/articles', '/about', '/contact', '/articles/test'];

function parseArgs(argv) {
  const options = {
    mode: DEFAULT_MODE,
    device: DEFAULT_DEVICE,
    baseUrl: DEFAULT_BASE_URL,
    urlsOnly: false,
  };

  for (const arg of argv) {
    if (arg === '--urls-only') {
      options.urlsOnly = true;
      continue;
    }

    if (arg.startsWith('--mode=')) {
      options.mode = arg.slice('--mode='.length);
      continue;
    }

    if (arg.startsWith('--device=')) {
      options.device = arg.slice('--device='.length);
      continue;
    }

    if (arg.startsWith('--base-url=')) {
      options.baseUrl = arg.slice('--base-url='.length);
      continue;
    }
  }

  if (options.mode !== 'core' && options.mode !== 'all') {
    throw new Error(`Invalid --mode value: ${options.mode}`);
  }

  if (options.device !== 'mobile' && options.device !== 'desktop') {
    throw new Error(`Invalid --device value: ${options.device}`);
  }

  return options;
}

function normalizeUrl(input, baseUrl) {
  const url = baseUrl ? new URL(input, baseUrl) : new URL(input);
  url.hash = '';
  if (url.pathname !== '/') {
    url.pathname = url.pathname.replace(/\/+$/, '');
  }
  return url.toString();
}

function unique(values) {
  return [...new Set(values)];
}

async function resolveTargetUrls({ mode, baseUrl }) {
  if (mode === 'core') {
    return CORE_PATHS.map((pathName) => normalizeUrl(pathName, baseUrl));
  }

  const sitemapUrl = new URL('/sitemap.xml', baseUrl).toString();
  const response = await fetch(sitemapUrl, {
    headers: {
      accept: 'application/xml,text/xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${sitemapUrl} (${response.status})`);
  }

  const sitemapXml = await response.text();
  const locMatches = sitemapXml.matchAll(/<loc>(.*?)<\/loc>/gim);
  const urls = [];

  for (const match of locMatches) {
    const raw = match[1]?.trim();
    if (!raw) {
      continue;
    }
    const decoded = raw.replace(/&amp;/g, '&');
    urls.push(normalizeUrl(decoded, baseUrl));
  }

  return unique(urls);
}

function reportKeyFromUrl(url) {
  const parsed = new URL(url);
  const pathKey =
    parsed.pathname === '/'
      ? 'home'
      : parsed.pathname.replace(/^\/|\/$/g, '').replace(/\/+/g, '__');

  if (!parsed.search) {
    return pathKey;
  }

  const queryKey = parsed.search.slice(1).replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return queryKey ? `${pathKey}__${queryKey}` : pathKey;
}

function toNumber(value) {
  return Number.isFinite(value) ? Number(value) : null;
}

function runLighthouse({ url, device, outputPath }) {
  const args = [
    'lighthouse',
    url,
    '--output=json',
    `--output-path=${outputPath}`,
    '--only-categories=performance',
    '--quiet',
    '--chrome-flags=--headless',
    `--form-factor=${device}`,
  ];

  if (device === 'desktop') {
    args.push('--screenEmulation.disabled');
  }

  execFileSync('npx', args, {
    stdio: 'inherit',
  });
}

function summarizeLighthouseReport(filePath, fallbackUrl) {
  const report = JSON.parse(readFileSync(filePath, 'utf8'));
  const score = toNumber((report.categories?.performance?.score ?? 0) * 100);

  return {
    url: normalizeUrl(report.finalUrl || fallbackUrl),
    requestedUrl: normalizeUrl(fallbackUrl),
    score,
    cls: toNumber(report.audits?.['cumulative-layout-shift']?.numericValue),
    lcpMs: toNumber(report.audits?.['largest-contentful-paint']?.numericValue),
    ttiMs: toNumber(report.audits?.interactive?.numericValue),
    file: filePath,
    fetchedAt: new Date().toISOString(),
  };
}

function printSummary(device, mode, summaries) {
  console.log(`[perf-run] Completed ${device} (${mode}) for ${summaries.length} URLs.`);
  for (const summary of summaries) {
    const scoreLabel = summary.score == null ? 'n/a' : summary.score.toFixed(1);
    const clsLabel = summary.cls == null ? 'n/a' : summary.cls.toFixed(3);
    console.log(`- ${scoreLabel} | CLS ${clsLabel} | ${summary.url}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const perfDir = path.resolve(process.cwd(), '.perf');
  const deviceDir = path.join(perfDir, `lh-${options.device}`);

  mkdirSync(perfDir, { recursive: true });
  mkdirSync(deviceDir, { recursive: true });

  const urls = await resolveTargetUrls(options);
  if (urls.length === 0) {
    throw new Error(`No URLs found for mode=${options.mode}`);
  }

  const urlListContent = `${urls.join('\n')}\n`;
  writeFileSync(path.join(perfDir, `urls-${options.mode}.txt`), urlListContent, 'utf8');
  writeFileSync(path.join(perfDir, 'urls.txt'), urlListContent, 'utf8');

  console.log(`[perf-run] Resolved ${urls.length} URLs (mode=${options.mode}).`);

  if (options.urlsOnly) {
    return;
  }

  const summaries = [];
  const failures = [];

  for (const url of urls) {
    const reportFileName = `${reportKeyFromUrl(url)}.json`;
    const reportPath = path.join(deviceDir, reportFileName);

    try {
      runLighthouse({
        url,
        device: options.device,
        outputPath: reportPath,
      });
      summaries.push(summarizeLighthouseReport(reportPath, url));
    } catch (error) {
      failures.push({
        url,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  summaries.sort((a, b) => a.url.localeCompare(b.url));
  writeFileSync(
    path.join(deviceDir, `summary-${options.mode}.json`),
    `${JSON.stringify(summaries, null, 2)}\n`,
    'utf8',
  );

  printSummary(options.device, options.mode, summaries);

  if (failures.length > 0) {
    console.error('[perf-run] Lighthouse failed for the following URLs:');
    for (const failure of failures) {
      console.error(`- ${failure.url}`);
      console.error(`  ${failure.message}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[perf-run] Fatal error');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
