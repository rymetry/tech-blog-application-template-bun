import type { MicroCMSQueries } from 'microcms-js-sdk';

const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY || '';

const ENDPOINT_URLS = {
  ARTICLES: process.env.MICROCMS_ARTICLES || '',
  AUTHORS: process.env.MICROCMS_AUTHORS || '',
  TAGS: process.env.MICROCMS_TAGS || '',
} as const;

if (!MICROCMS_API_KEY) {
  console.warn('MICROCMS_API_KEY environment variable is not set.');
}

Object.entries(ENDPOINT_URLS).forEach(([key, value]) => {
  if (!value) {
    console.warn(`MicroCMS endpoint URL for ${key.toLowerCase()} is not set.`);
  }
});

export const MICROCMS_REVALIDATE_SECONDS = 300;

export const MICROCMS_CACHE_TAGS = {
  ARTICLES: 'microcms:articles',
  AUTHORS: 'microcms:authors',
  TAGS: 'microcms:tags',
} as const;

type MicroCMSCacheTag = (typeof MICROCMS_CACHE_TAGS)[keyof typeof MICROCMS_CACHE_TAGS];

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

interface NextFetchOptions extends RequestInit {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
}

const fetchFromMicroCMS = async <T>(
  endpointUrl: string,
  cacheTag: MicroCMSCacheTag,
  queries?: MicroCMSQueries,
): Promise<T> => {
  if (!endpointUrl) {
    throw new Error('MicroCMS endpoint URL is not configured.');
  }

  const url = new URL(endpointUrl);
  appendQueries(url, queries);

  const fetchOptions: NextFetchOptions = {
    headers: {
      'X-MICROCMS-API-KEY': MICROCMS_API_KEY,
      Accept: 'application/json',
    },
    next: {
      revalidate: MICROCMS_REVALIDATE_SECONDS,
      tags: ['microcms', cacheTag],
    },
  };

  const response = await fetch(url.toString(), fetchOptions);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url.toString()}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
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

// 型定義
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

export type MicroCMSAuthorResponse = MicroCMSListResponse<MicroCMSAuthor>;
export type MicroCMSTagResponse = MicroCMSListResponse<MicroCMSTag>;

// エンドポイントの定義
const ENDPOINTS = {
  ARTICLES: ENDPOINT_URLS.ARTICLES,
  TAGS: ENDPOINT_URLS.TAGS,
  AUTHORS: ENDPOINT_URLS.AUTHORS,
};

/**
 * 記事一覧を取得する
 */
export const getList = async (queries?: MicroCMSQueries, endpoint = ENDPOINTS.ARTICLES) => {
  const targetEndpoint = endpoint || ENDPOINTS.ARTICLES;

  if (!targetEndpoint) {
    console.error('MicroCMS articles endpoint URL is not configured.');
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }

  try {
    const listData = await fetchFromMicroCMS<ArticleResponse>(
      targetEndpoint,
      MICROCMS_CACHE_TAGS.ARTICLES,
      queries,
    );
    return listData;
  } catch (error) {
    console.error(`Error fetching from endpoint ${targetEndpoint}:`, error);
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }
};

/**
 * 記事詳細を取得する
 * @param contentId コンテンツID
 * @param queries クエリパラメータ
 * @param endpoint エンドポイント
 * @returns 記事詳細
 */
export const getDetail = async (
  contentId: string,
  queries?: MicroCMSQueries,
  endpoint = ENDPOINTS.ARTICLES,
) => {
  const targetEndpoint = endpoint || ENDPOINTS.ARTICLES;

  if (!targetEndpoint) {
    throw new Error('MicroCMS articles endpoint URL is not configured.');
  }

  try {
    // depthパラメータを設定して関連コンテンツの詳細も取得
    const mergedQueries = { ...queries, depth: 3 as const };
    const detailUrl = createDetailUrl(targetEndpoint, contentId);
    const detailData = await fetchFromMicroCMS<Article>(
      detailUrl,
      MICROCMS_CACHE_TAGS.ARTICLES,
      mergedQueries,
    );

    return detailData;
  } catch (error) {
    console.error(`Error fetching detail from endpoint ${targetEndpoint}:`, error);
    throw error;
  }
};

/**
 * タグ一覧を取得する
 */
export const getTags = async (queries?: MicroCMSQueries) => {
  const targetEndpoint = ENDPOINTS.TAGS;

  if (!targetEndpoint) {
    console.error('MicroCMS tags endpoint URL is not configured.');
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }

  try {
    const tagsData = await fetchFromMicroCMS<MicroCMSTagResponse>(
      targetEndpoint,
      MICROCMS_CACHE_TAGS.TAGS,
      queries,
    );
    return tagsData;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }
};

/**
 * 著者一覧を取得する
 */
export const getAuthors = async (queries?: MicroCMSQueries) => {
  const targetEndpoint = ENDPOINTS.AUTHORS;

  if (!targetEndpoint) {
    console.error('MicroCMS authors endpoint URL is not configured.');
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }

  try {
    const authorsData = await fetchFromMicroCMS<MicroCMSAuthorResponse>(
      targetEndpoint,
      MICROCMS_CACHE_TAGS.AUTHORS,
      queries,
    );
    return authorsData;
  } catch (error) {
    console.error('Error fetching authors:', error);
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }
};
