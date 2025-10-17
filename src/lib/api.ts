import { adaptAuthor, adaptArticle, adaptTag } from '@/lib/adapters';
import type { Author, ArticlePost, Tag } from '@/types';
import {
  getList,
  getAuthors as getMicroCMSAuthors,
  getTags as getMicroCMSTags,
  MICROCMS_CACHE_TAGS,
  MICROCMS_REVALIDATE_SECONDS,
} from './microcms';
import { unstable_cache } from 'next/cache';

export interface ArticleResponse {
  contents: ArticlePost[];
  totalCount: number;
  offset: number;
  limit: number;
}

export interface TagResponse {
  contents: Tag[];
  totalCount: number;
  offset: number;
  limit: number;
}

export interface AuthorResponse {
  contents: Author[];
  totalCount: number;
  offset: number;
  limit: number;
}

type ArticlePostParams = {
  offset?: number;
  limit?: number;
  filters?: string;
  q?: string;
  orders?: string;
};

const DEFAULT_ARTICLE_LIMIT = 10;
const DEFAULT_TAG_LIMIT = 10;
const DEFAULT_AUTHOR_LIMIT = 10;

// MicroCMSの一覧取得はパラメータごとに結果が変わるため、キャッシュキーに条件を埋め込んで誤キャッシュを防ぐ。
const getArticleParamsKey = (params: ArticlePostParams) => [
  'microcms',
  'article-posts',
  `offset:${params.offset ?? 0}`,
  `limit:${params.limit ?? DEFAULT_ARTICLE_LIMIT}`,
  `filters:${params.filters ?? ''}`,
  `q:${params.q ?? ''}`,
  `orders:${params.orders ?? ''}`,
];

const fetchArticlePostsCached = async (params: ArticlePostParams = {}): Promise<ArticleResponse> =>
  unstable_cache(
    async () => {
      const limit = params.limit ?? DEFAULT_ARTICLE_LIMIT;
      const response = await getList({
        offset: params.offset,
        limit,
        filters: params.filters,
        q: params.q,
        orders: params.orders,
      });

      return {
        contents: response.contents.map(adaptArticle),
        totalCount: response.totalCount,
        offset: response.offset,
        limit: response.limit,
      };
    },
    getArticleParamsKey(params),
    {
      revalidate: MICROCMS_REVALIDATE_SECONDS,
      tags: ['microcms', MICROCMS_CACHE_TAGS.ARTICLES],
    },
  )();

// 記事詳細はslugごとにキャッシュを分離し、ISRの恩恵を保ちつつ取り違いを防ぐ。
const fetchArticlePostCached = async (slug: string): Promise<ArticlePost> =>
  unstable_cache(
    async () => {
      const { contents } = await getList({
        filters: `slug[equals]${slug}`,
        limit: 1,
        depth: 3 as const,
      });

      const matchedPost = contents[0];

      if (!matchedPost) {
        throw new Error(`Article post not found for slug: ${slug}`);
      }

      return adaptArticle(matchedPost);
    },
    ['microcms', 'article-post', slug],
    {
      revalidate: MICROCMS_REVALIDATE_SECONDS,
      tags: ['microcms', MICROCMS_CACHE_TAGS.ARTICLES],
    },
  )();

const fetchTagsCached = unstable_cache(
  async (): Promise<TagResponse> => {
    const response = await getMicroCMSTags({ limit: DEFAULT_TAG_LIMIT });

    return {
      contents: response.contents.map(adaptTag),
      totalCount: response.totalCount,
      offset: response.offset,
      limit: response.limit,
    };
  },
  ['microcms', 'tags'],
  {
    revalidate: MICROCMS_REVALIDATE_SECONDS,
    tags: ['microcms', MICROCMS_CACHE_TAGS.TAGS],
  },
);

const fetchAuthorsCached = unstable_cache(
  async (): Promise<AuthorResponse> => {
    const response = await getMicroCMSAuthors({ limit: DEFAULT_AUTHOR_LIMIT });

    return {
      contents: response.contents.map(adaptAuthor),
      totalCount: response.totalCount,
      offset: response.offset,
      limit: response.limit,
    };
  },
  ['microcms', 'authors'],
  {
    revalidate: MICROCMS_REVALIDATE_SECONDS,
    tags: ['microcms', MICROCMS_CACHE_TAGS.AUTHORS],
  },
);

/**
 * ブログ記事一覧を取得する
 */
export async function getArticlePosts(
  params: ArticlePostParams = {},
): Promise<ArticleResponse> {
  try {
    return await fetchArticlePostsCached(params);
  } catch (error) {
    console.error('Error in getArticlePosts:', error);
    return { contents: [], totalCount: 0, offset: 0, limit: DEFAULT_ARTICLE_LIMIT };
  }
}

/**
 * ブログ記事詳細を取得する
 * depthパラメータを使用して関連コンテンツの詳細も取得する
 */
export async function getArticlePost(slug: string): Promise<ArticlePost> {
  try {
    // キャッシュされた記事詳細を取得
    return await fetchArticlePostCached(slug);
  } catch (error) {
    console.error(`Error in getArticlePost for slug ${slug}:`, error);
    throw error;
  }
}

/**
 * タグ一覧を取得する
 */
export async function getTags(): Promise<TagResponse> {
  try {
    return await fetchTagsCached();
  } catch (error) {
    console.error('Error in getTags:', error);
    return { contents: [], totalCount: 0, offset: 0, limit: DEFAULT_TAG_LIMIT };
  }
}

/**
 * 著者一覧を取得する
 */
export async function getAuthors(): Promise<AuthorResponse> {
  try {
    return await fetchAuthorsCached();
  } catch (error) {
    console.error('Error in getAuthors:', error);
    return { contents: [], totalCount: 0, offset: 0, limit: DEFAULT_AUTHOR_LIMIT };
  }
}
