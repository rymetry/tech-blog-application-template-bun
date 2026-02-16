import { portfolioConfig } from '@/lib/portfolio-config';
import { logWarnEvent } from '@/lib/log-warn';

const DEFAULT_SITE_NAME = portfolioConfig.ownerName;
const DEFAULT_DESCRIPTION =
  'Portfolio of a Software Engineer focused on product development, system design, and reliable delivery.';
const DEFAULT_KEYWORDS = [
  'portfolio',
  'software engineer',
  'product engineering',
  'system design',
  'web development',
  'typescript',
  'next.js',
  'developer experience',
  'observability',
  'performance',
];
const DEFAULT_OG_IMAGE_PATH = '/placeholder.jpg';
const DEFAULT_LOCALE = 'ja_JP';
const DEFAULT_FEED_PATH = '/feed.xml';
export const SITE_TITLE_TEMPLATE = `%s | ${DEFAULT_SITE_NAME}`;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const normalizeHostname = (value: string) => value.replace(/^https?:\/\//i, '').replace(/\/+$/, '');

const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

const isCiTruthy = (value: string | undefined) => {
  if (!value) {
    return false;
  }

  return /^(true|1|yes)$/i.test(value.trim());
};

const resolveLocalhostHostname = (hostname: string) => {
  const normalized = hostname.toLowerCase();
  return LOCALHOST_HOSTNAMES.has(normalized);
};

const assertEnvContract = (env: NodeJS.ProcessEnv) => {
  if (env.SITE_URL) {
    throw new Error(
      'SITE_URL is no longer supported. Configure NEXT_PUBLIC_SITE_URL or rely on VERCEL_URL in production.',
    );
  }
};

export const resolveSiteUrlForEnv = (
  env: NodeJS.ProcessEnv = process.env,
  options: { onLocalhostOverrideUsed?: (context: { host: string }) => void } = {},
) => {
  assertEnvContract(env);

  const strictMode = env.NODE_ENV === 'production';
  const localhostOverride = env.ALLOW_LOCALHOST_SITE_URL_FOR_BUILD === '1';
  const onVercel = env.VERCEL === '1';
  const onCi = isCiTruthy(env.CI);

  if (localhostOverride && (onVercel || onCi)) {
    throw new Error(
      'ALLOW_LOCALHOST_SITE_URL_FOR_BUILD=1 is local-only. Disable it when VERCEL=1 or CI is truthy.',
    );
  }

  const urlFromEnv = (env.NEXT_PUBLIC_SITE_URL || '').trim();
  let resolvedUrl: URL | null = null;

  if (urlFromEnv) {
    try {
      resolvedUrl = new URL(urlFromEnv);
    } catch {
      throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute URL (for example, https://example.com).');
    }
  }

  if (!resolvedUrl && strictMode) {
    const vercelUrl = (env.VERCEL_URL || '').trim();
    if (vercelUrl) {
      resolvedUrl = new URL(`https://${normalizeHostname(vercelUrl)}`);
    } else {
      throw new Error(
        'Site URL is not set. Configure NEXT_PUBLIC_SITE_URL (preferred) or rely on VERCEL_URL in production.',
      );
    }
  }

  if (!resolvedUrl) {
    resolvedUrl = new URL('http://localhost:3000');
  }

  if (strictMode && resolveLocalhostHostname(resolvedUrl.hostname)) {
    if (!localhostOverride) {
      throw new Error(
        'Localhost site URLs are not allowed in production. Set NEXT_PUBLIC_SITE_URL to your public domain.',
      );
    }

    const context = { host: resolvedUrl.host };
    options.onLocalhostOverrideUsed?.(context);
    logWarnEvent({
      event: 'site_url_localhost_override_used',
      reason: 'allow_localhost_site_url_for_build',
      context,
    });
  }

  return trimTrailingSlash(resolvedUrl.toString());
};

const resolveSiteUrl = () => resolveSiteUrlForEnv(process.env);

export const siteMetadata = {
  name: DEFAULT_SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  url: resolveSiteUrl(),
  locale: DEFAULT_LOCALE,
  feedPath: DEFAULT_FEED_PATH,
  twitter: {
    site: '@your_handle',
    creator: '@your_handle',
    cardType: 'summary_large_image' as const,
  },
  defaultOgImagePath: DEFAULT_OG_IMAGE_PATH,
};

export const metadataBase = new URL(siteMetadata.url);

export const absoluteUrl = (path = '/') => {
  try {
    return new URL(path, metadataBase).toString();
  } catch (error) {
    console.error('Failed to resolve absolute URL for path:', path, error);
    return path;
  }
};

export const feedUrl = absoluteUrl(siteMetadata.feedPath);

export const buildOgImage = (
  imageUrl?: string,
  altText?: string,
  dimensions: { width?: number; height?: number } = {},
) => {
  const url = imageUrl ? absoluteUrl(imageUrl) : absoluteUrl(siteMetadata.defaultOgImagePath);
  const alt = altText || siteMetadata.name;

  return {
    url,
    width: dimensions.width ?? 1200,
    height: dimensions.height ?? 630,
    alt,
  };
};
