import type { MicroCMSQueries } from 'microcms-js-sdk';

const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY || '';

const ENDPOINT_URLS = {
  ARTICLES: process.env.NEXT_PUBLIC_MICROCMS_ARTICLES_API || '',
  AUTHORS: process.env.NEXT_PUBLIC_MICROCMS_AUTHORS_API || '',
  TAGS: process.env.NEXT_PUBLIC_MICROCMS_TAGS_API || '',
} as const;

if (!MICROCMS_API_KEY) {
  console.warn('MICROCMS_API_KEY environment variable is not set.');
}

Object.entries(ENDPOINT_URLS).forEach(([key, value]) => {
  if (!value) {
    console.warn(`MicroCMS endpoint URL for ${key.toLowerCase()} is not set.`);
  }
});

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

const fetchFromMicroCMS = async <T>(endpointUrl: string, queries?: MicroCMSQueries): Promise<T> => {
  if (!endpointUrl) {
    throw new Error('MicroCMS endpoint URL is not configured.');
  }

  const url = new URL(endpointUrl);
  appendQueries(url, queries);

  const response = await fetch(url.toString(), {
    headers: {
      'X-MICROCMS-API-KEY': MICROCMS_API_KEY,
    },
    cache: 'no-store',
  });

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
  blog_body?: string;
  showToc?: boolean;
  body?: string;
  related_blogs?: Blog[];
  relatedArticles?: Blog[];
};

export type MicroCMSListResponse<T> = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: T[];
};

// 型定義
export type BlogResponse = MicroCMSListResponse<Blog>;

export type Blog = {
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
  BLOGS: ENDPOINT_URLS.ARTICLES,
  TAGS: ENDPOINT_URLS.TAGS,
  AUTHORS: ENDPOINT_URLS.AUTHORS,
};

/**
 * ブログ記事一覧を取得する
 */
export const getList = async (queries?: MicroCMSQueries, endpoint = ENDPOINTS.BLOGS) => {
  const targetEndpoint = endpoint || ENDPOINTS.BLOGS;

  if (!targetEndpoint) {
    console.error('MicroCMS articles endpoint URL is not configured.');
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }

  try {
    const listData = await fetchFromMicroCMS<BlogResponse>(targetEndpoint, queries);
    return listData;
  } catch (error) {
    console.error(`Error fetching from endpoint ${targetEndpoint}:`, error);
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }
};

/**
 * ブログ記事詳細を取得する
 * @param contentId コンテンツID
 * @param queries クエリパラメータ
 * @param endpoint エンドポイント
 * @returns ブログ記事詳細
 */
export const getDetail = async (
  contentId: string,
  queries?: MicroCMSQueries,
  endpoint = ENDPOINTS.BLOGS,
) => {
  const targetEndpoint = endpoint || ENDPOINTS.BLOGS;

  if (!targetEndpoint) {
    throw new Error('MicroCMS articles endpoint URL is not configured.');
  }

  try {
    // depthパラメータを設定して関連コンテンツの詳細も取得
    const mergedQueries = { ...queries, depth: 3 as const };
    const detailUrl = createDetailUrl(targetEndpoint, contentId);
    const detailData = await fetchFromMicroCMS<Blog>(detailUrl, mergedQueries);

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
    const tagsData = await fetchFromMicroCMS<MicroCMSTagResponse>(targetEndpoint, queries);
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
    const authorsData = await fetchFromMicroCMS<MicroCMSAuthorResponse>(targetEndpoint, queries);
    return authorsData;
  } catch (error) {
    console.error('Error fetching authors:', error);
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }
};
