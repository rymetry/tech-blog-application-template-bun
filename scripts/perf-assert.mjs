#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_BASE_URL = 'https://tech-blog-application-template-bun.vercel.app';
const DEFAULT_MODE = 'core';
const SCORE_THRESHOLD = 95;
const ARTICLES_CLS_THRESHOLD = 0.1;
const CORE_PATHS = ['/', '/projects', '/articles', '/about', '/contact', '/articles/test'];

function parseArgs(argv) {
  const options = {
    mode: DEFAULT_MODE,
    baseUrl: DEFAULT_BASE_URL,
  };

  for (const arg of argv) {
    if (arg.startsWith('--mode=')) {
      options.mode = arg.slice('--mode='.length);
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

function loadSummary(perfDir, device, mode) {
  const summaryPath = path.join(perfDir, `lh-${device}`, `summary-${mode}.json`);
  if (!existsSync(summaryPath)) {
    throw new Error(
      `Summary not found: ${summaryPath}. Run "perf:lh:${device}" first.`,
    );
  }

  const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
  if (!Array.isArray(summary)) {
    throw new Error(`Invalid summary format: ${summaryPath}`);
  }

  return summary;
}

function buildSummaryMap(summary) {
  const map = new Map();
  for (const item of summary) {
    if (!item?.url) {
      continue;
    }
    map.set(normalizeUrl(item.url), item);
  }
  return map;
}

function resolveTargetUrls({ perfDir, mode, baseUrl }) {
  const urlsPath = path.join(perfDir, `urls-${mode}.txt`);

  if (existsSync(urlsPath)) {
    const urls = readFileSync(urlsPath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((url) => normalizeUrl(url, baseUrl));

    if (urls.length === 0) {
      throw new Error(`No URLs found in ${urlsPath}`);
    }

    return [...new Set(urls)].sort((a, b) => a.localeCompare(b));
  }

  if (mode === 'core') {
    return CORE_PATHS.map((pathName) => normalizeUrl(pathName, baseUrl));
  }

  throw new Error(
    `Target URL list not found: ${urlsPath}. Run "npm run perf:urls -- --mode=${mode}" before "perf:assert".`,
  );
}

function formatScore(value) {
  return Number.isFinite(value) ? Number(value).toFixed(1) : 'n/a';
}

function formatCls(value) {
  return Number.isFinite(value) ? Number(value).toFixed(3) : 'n/a';
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const perfDir = path.resolve(process.cwd(), '.perf');

  const mobileSummary = loadSummary(perfDir, 'mobile', options.mode);
  const desktopSummary = loadSummary(perfDir, 'desktop', options.mode);
  const mobileMap = buildSummaryMap(mobileSummary);
  const desktopMap = buildSummaryMap(desktopSummary);
  const targetUrls = resolveTargetUrls({ perfDir, ...options });

  if (targetUrls.length === 0) {
    throw new Error(`No target URLs found for mode=${options.mode}`);
  }

  const failures = [];

  for (const url of targetUrls) {
    const mobile = mobileMap.get(url);
    const desktop = desktopMap.get(url);

    if (!mobile) {
      failures.push(`[missing] mobile summary not found for ${url}`);
      continue;
    }

    if (!desktop) {
      failures.push(`[missing] desktop summary not found for ${url}`);
      continue;
    }

    if (!Number.isFinite(mobile.score) || mobile.score < SCORE_THRESHOLD) {
      failures.push(
        `[score] mobile ${formatScore(mobile.score)} < ${SCORE_THRESHOLD} for ${url}`,
      );
    }

    if (!Number.isFinite(desktop.score) || desktop.score < SCORE_THRESHOLD) {
      failures.push(
        `[score] desktop ${formatScore(desktop.score)} < ${SCORE_THRESHOLD} for ${url}`,
      );
    }
  }

  const articlesUrl = normalizeUrl('/articles', options.baseUrl);
  const articlesMobile = mobileMap.get(articlesUrl);
  const articlesDesktop = desktopMap.get(articlesUrl);

  if (!articlesMobile) {
    failures.push(`[cls] mobile summary for /articles is missing (${articlesUrl})`);
  } else if (!Number.isFinite(articlesMobile.cls) || articlesMobile.cls > ARTICLES_CLS_THRESHOLD) {
    failures.push(
      `[cls] mobile CLS ${formatCls(articlesMobile.cls)} > ${ARTICLES_CLS_THRESHOLD.toFixed(1)} for ${articlesUrl}`,
    );
  }

  if (!articlesDesktop) {
    failures.push(`[cls] desktop summary for /articles is missing (${articlesUrl})`);
  } else if (!Number.isFinite(articlesDesktop.cls) || articlesDesktop.cls > ARTICLES_CLS_THRESHOLD) {
    failures.push(
      `[cls] desktop CLS ${formatCls(articlesDesktop.cls)} > ${ARTICLES_CLS_THRESHOLD.toFixed(1)} for ${articlesUrl}`,
    );
  }

  console.log(`[perf-assert] mode=${options.mode} targetUrls=${targetUrls.length}`);
  for (const url of targetUrls) {
    const mobile = mobileMap.get(url);
    const desktop = desktopMap.get(url);
    if (!mobile || !desktop) {
      continue;
    }
    console.log(
      `- ${url}\n  mobile=${formatScore(mobile.score)} cls=${formatCls(mobile.cls)} desktop=${formatScore(desktop.score)} cls=${formatCls(desktop.cls)}`,
    );
  }

  if (failures.length > 0) {
    console.error('[perf-assert] Failed checks:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('[perf-assert] All checks passed.');
}

try {
  main();
} catch (error) {
  console.error('[perf-assert] Fatal error');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
