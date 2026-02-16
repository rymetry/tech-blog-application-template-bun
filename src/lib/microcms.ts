import { logWarnEvent } from '@/lib/log-warn';
import type { MicroCMSQueries } from 'microcms-js-sdk';

const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY || '';

const ENDPOINT_URLS = {
  ARTICLES: process.env.MICROCMS_ARTICLES || '',
  TAGS: process.env.MICROCMS_TAGS || '',
} as const;

if (!MICROCMS_API_KEY) {
  logWarnEvent({
    event: 'microcms_api_key_missing',
    reason: 'env_not_set',
    context: { env: 'MICROCMS_API_KEY' },
  });
}

for (const [key, value] of Object.entries(ENDPOINT_URLS)) {
  if (value) {
    continue;
  }

  logWarnEvent({
    event: 'microcms_endpoint_missing',
    reason: 'env_not_set',
    context: { endpoint: key.toLowerCase() },
  });
}

export const MICROCMS_REVALIDATE_SECONDS = 300;

export const MICROCMS_CACHE_TAGS = {
  ARTICLES: 'microcms:articles',
  TAGS: 'microcms:tags',
} as const;

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ORDER_FALLBACK_PATTERN = /\b(orders?|sort)\b/i;

type MicroCMSCacheTag = (typeof MICROCMS_CACHE_TAGS)[keyof typeof MICROCMS_CACHE_TAGS];
export type MicroCMSCacheMode = 'revalidate' | 'no-store';

type NextFetchOptions = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

type MicroCMSFetchOptions = {
  queries?: MicroCMSQueries;
  cacheMode?: MicroCMSCacheMode;
};

type MicroCMSReadOptions = {
  cacheMode?: MicroCMSCacheMode;
};

const createDetailUrl = (baseUrl: string, contentId: string) => {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(encodeURIComponent(contentId), normalizedBase).toString();
};

const appendQueries = (url: URL, queries?: MicroCMSQueries) => {
  if (!queries) {
    return;
  }

  for (const [key, value] of Object.entries(queries)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      url.searchParams.set(key, value.join(','));
      continue;
    }

    url.searchParams.set(key, String(value));
  }
};

const createEmptyListResponse = <T>() => ({
  contents: [] as T[],
  totalCount: 0,
  offset: 0,
  limit: 10,
});

export class MicroCmsHttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly body: string;

  constructor(params: { status: number; statusText: string; url: string; body: string }) {
    const { status, statusText, url, body } = params;
    super(`Failed to fetch ${url}: ${status} ${statusText}`);
    this.name = 'MicroCmsHttpError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.body = body;
  }
}

const createMicroCmsHttpError = async (response: Response, url: string) => {
  let body = '';

  try {
    body = (await response.text()).slice(0, 500);
  } catch {
    body = '';
  }

  return new MicroCmsHttpError({
    status: response.status,
    statusText: response.statusText,
    url,
    body,
  });
};

const fetchFromMicroCMS = async <T>(
  endpointUrl: string,
  cacheTag: MicroCMSCacheTag,
  options: MicroCMSFetchOptions = {},
): Promise<T> => {
  if (!endpointUrl) {
    throw new Error('MicroCMS endpoint URL is not configured.');
  }

  const { queries, cacheMode = 'revalidate' } = options;
  const url = new URL(endpointUrl);
  appendQueries(url, queries);

  const fetchOptions: NextFetchOptions = {
    headers: {
      'X-MICROCMS-API-KEY': MICROCMS_API_KEY,
      Accept: 'application/json',
    },
    ...(cacheMode === 'no-store'
      ? { cache: 'no-store' }
      : {
          next: {
            revalidate: MICROCMS_REVALIDATE_SECONDS,
            tags: ['microcms', cacheTag],
          },
        }),
  };

  const targetUrl = url.toString();
  const response = await fetch(targetUrl, fetchOptions);

  if (!response.ok) {
    throw await createMicroCmsHttpError(response, targetUrl);
  }

  return response.json() as Promise<T>;
};

const shouldRetryWithoutOrders = (
  error: unknown,
): error is MicroCmsHttpError => {
  if (!(error instanceof MicroCmsHttpError)) {
    return false;
  }

  if (error.status !== 400 && error.status !== 422) {
    return false;
  }

  const message = `${error.message} ${error.body}`;
  return ORDER_FALLBACK_PATTERN.test(message);
};

const fetchArticlesListRaw = async (
  queries?: MicroCMSQueries,
  options: MicroCMSReadOptions = {},
) => {
  const targetEndpoint = ENDPOINT_URLS.ARTICLES;

  if (!targetEndpoint) {
    throw new Error('MicroCMS articles endpoint URL is not configured.');
  }

  try {
    return await fetchFromMicroCMS<ArticleResponse>(targetEndpoint, MICROCMS_CACHE_TAGS.ARTICLES, {
      queries,
      cacheMode: options.cacheMode,
    });
  } catch (error) {
    if (!queries?.orders || !shouldRetryWithoutOrders(error)) {
      throw error;
    }

    const restQueries = { ...queries };
    delete restQueries.orders;
    logWarnEvent({
      event: 'microcms_orders_fallback_used',
      reason: 'orders_rejected_by_api',
      context: { status: error.status },
    });

    return fetchFromMicroCMS<ArticleResponse>(targetEndpoint, MICROCMS_CACHE_TAGS.ARTICLES, {
      queries: restQueries,
      cacheMode: options.cacheMode,
    });
  }
};

export type MicroCMSImage = {
  url: string;
  height: number;
  width: number;
};

export type MicroCMSAuthor = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  name: string;
  image?: MicroCMSImage;
  profileImage?: MicroCMSImage;
  bio?: string;
  role?: string;
  email?: string;
  socialLinks?: Record<string, unknown>;
};

export type MicroCMSRichContent = {
  fieldId: string;
  toc_visible?: boolean;
  article_body?: string;
  showToc?: boolean;
  body?: string;
  related_articles?: Article[];
  relatedArticles?: Article[];
};

export type MicroCMSListResponse<T> = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: T[];
};

export type ArticleResponse = MicroCMSListResponse<Article>;

export type Article = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  slug: string;
  ogp_image?: MicroCMSImage;
  ogpImage?: MicroCMSImage;
  authors?: MicroCMSAuthor;
  tags?: {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    name: string;
  }[];
  custom_body?: MicroCMSRichContent;
  content?: MicroCMSRichContent;
  excerpt?: string;
};

export type MicroCMSTag = {
  id: string;
  name: string;
};

export type MicroCMSTagResponse = MicroCMSListResponse<MicroCMSTag>;

export const getListRawOrThrow = async (
  queries?: MicroCMSQueries,
  options: MicroCMSReadOptions = {},
) => {
  return fetchArticlesListRaw(queries, options);
};

export const getList = async (
  queries?: MicroCMSQueries,
  options: MicroCMSReadOptions = {},
) => {
  try {
    return await getListRawOrThrow(queries, options);
  } catch (error) {
    console.error('Error fetching article list from microCMS:', error);
    if (IS_PRODUCTION) {
      throw error;
    }

    return createEmptyListResponse<Article>();
  }
};

export const getDetail = async (
  contentId: string,
  queries?: MicroCMSQueries,
  options: MicroCMSReadOptions = {},
) => {
  const targetEndpoint = ENDPOINT_URLS.ARTICLES;

  if (!targetEndpoint) {
    throw new Error('MicroCMS articles endpoint URL is not configured.');
  }

  try {
    const mergedQueries = { ...queries, depth: 3 as const };
    const detailUrl = createDetailUrl(targetEndpoint, contentId);

    return await fetchFromMicroCMS<Article>(detailUrl, MICROCMS_CACHE_TAGS.ARTICLES, {
      queries: mergedQueries,
      cacheMode: options.cacheMode,
    });
  } catch (error) {
    console.error(`Error fetching detail from endpoint ${targetEndpoint}:`, error);
    throw error;
  }
};

export const getTags = async (
  queries?: MicroCMSQueries,
  options: MicroCMSReadOptions = {},
) => {
  const targetEndpoint = ENDPOINT_URLS.TAGS;

  if (!targetEndpoint) {
    const configError = new Error('MicroCMS tags endpoint URL is not configured.');
    if (IS_PRODUCTION) {
      throw configError;
    }

    console.error(configError.message);
    return createEmptyListResponse<MicroCMSTag>();
  }

  try {
    return await fetchFromMicroCMS<MicroCMSTagResponse>(targetEndpoint, MICROCMS_CACHE_TAGS.TAGS, {
      queries,
      cacheMode: options.cacheMode,
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    if (IS_PRODUCTION) {
      throw error;
    }

    return createEmptyListResponse<MicroCMSTag>();
  }
};
