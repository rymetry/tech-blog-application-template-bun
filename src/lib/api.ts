import { adaptAuthor, adaptArticle, adaptTag } from '@/lib/adapters';
import type { Author, ArticlePost, Tag } from '@/types';
import { getList, getAuthors as getMicroCMSAuthors, getTags as getMicroCMSTags } from './microcms';

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

/**
 * ブログ記事一覧を取得する
 */
export async function getArticlePosts(
  params: {
    offset?: number;
    limit?: number;
    filters?: string;
    q?: string;
  } = {},
): Promise<ArticleResponse> {
  try {
    const response = await getList({
      offset: params.offset,
      limit: params.limit,
      filters: params.filters,
      q: params.q,
    });

    return {
      contents: response.contents.map(adaptArticle),
      totalCount: response.totalCount,
      offset: response.offset,
      limit: response.limit,
    };
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
    // getDetail関数内でdepth=3が設定されるため、関連コンテンツの詳細も取得される
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
    const response = await getMicroCMSTags();

    return {
      contents: response.contents.map(adaptTag),
      totalCount: response.totalCount,
      offset: response.offset,
      limit: response.limit,
    };
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
    const response = await getMicroCMSAuthors();

    return {
      contents: response.contents.map(adaptAuthor),
      totalCount: response.totalCount,
      offset: response.offset,
      limit: response.limit,
    };
  } catch (error) {
    console.error('Error in getAuthors:', error);
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }
}
