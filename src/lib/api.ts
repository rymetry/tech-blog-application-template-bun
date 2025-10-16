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

const fetchArticlePostsCached = unstable_cache(
  async (params: ArticlePostParams = {}): Promise<ArticleResponse> => {
    const response = await getList({
      offset: params.offset,
      limit: params.limit,
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
  ['microcms', 'article-posts'],
  {
    revalidate: MICROCMS_REVALIDATE_SECONDS,
    tags: [MICROCMS_CACHE_TAGS.ARTICLES],
  },
);

const fetchArticlePostCached = unstable_cache(
  async (slug: string): Promise<ArticlePost> => {
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
  ['microcms', 'article-post'],
  {
    revalidate: MICROCMS_REVALIDATE_SECONDS,
    tags: [MICROCMS_CACHE_TAGS.ARTICLES],
  },
);

const fetchTagsCached = unstable_cache(
  async (): Promise<TagResponse> => {
    const response = await getMicroCMSTags();

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
    tags: [MICROCMS_CACHE_TAGS.TAGS],
  },
);

const fetchAuthorsCached = unstable_cache(
  async (): Promise<AuthorResponse> => {
    const response = await getMicroCMSAuthors();

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
    tags: [MICROCMS_CACHE_TAGS.AUTHORS],
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
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
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
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
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
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }
}
