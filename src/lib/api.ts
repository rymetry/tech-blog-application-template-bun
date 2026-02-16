import { adaptArticle, adaptTag } from '@/lib/adapters';
import { getAllArticlesCached } from '@/lib/articles-cache';
import { logWarnEvent } from '@/lib/log-warn';
import type { ArticlePost, Tag } from '@/types';
import {
  getDetail,
  IS_PRODUCTION,
  getList,
  getListRawOrThrow,
  MICROCMS_MAX_LIMIT,
  toSafeErrorLogContext,
  getTags as getMicroCMSTags,
  type MicroCMSCacheMode,
} from './microcms';

export interface ArticleResponse {
  contents: ArticlePost[];
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

export type AdjacentArticles = {
  prevPost: ArticlePost | null;
  nextPost: ArticlePost | null;
};

const DEFAULT_ARTICLE_LIMIT = 10;
const ADJACENT_SAME_PUBLISHED_AT_LIMIT = 1000;

const getEmptyArticleResponse = (): ArticleResponse => ({
  contents: [],
  totalCount: 0,
  offset: 0,
  limit: DEFAULT_ARTICLE_LIMIT,
});

const fetchArticlePostFromApi = async (
  slug: string,
  options: { draftKey?: string; cacheMode?: MicroCMSCacheMode } = {},
): Promise<ArticlePost | null> => {
  const queries: Record<string, unknown> = {
    filters: `slug[equals]${slug}`,
    limit: 1,
    depth: 3 as const,
  };

  if (options.draftKey) {
    queries.draftKey = options.draftKey;
  }

  const { contents } = await getList(queries, { cacheMode: options.cacheMode });
  const matchedPost = contents[0];

  if (!matchedPost) {
    return null;
  }

  return adaptArticle(matchedPost);
};

const compareByPublishedAtDescAndIdDesc = (
  a: Pick<ArticlePost, 'publishedAt' | 'id'>,
  b: Pick<ArticlePost, 'publishedAt' | 'id'>,
) => {
  if (a.publishedAt !== b.publishedAt) {
    return b.publishedAt.localeCompare(a.publishedAt);
  }

  return b.id.localeCompare(a.id);
};

type RawArticleListResponse = Awaited<ReturnType<typeof getListRawOrThrow>>;

const getSamePublishedAtArticlesWithLimit = async (
  publishedAt: string,
): Promise<Pick<RawArticleListResponse, 'contents' | 'totalCount'>> => {
  const contents: RawArticleListResponse['contents'] = [];
  let totalCount = 0;
  let offset = 0;

  while (offset < ADJACENT_SAME_PUBLISHED_AT_LIMIT) {
    const remaining = ADJACENT_SAME_PUBLISHED_AT_LIMIT - offset;
    const response = await getListRawOrThrow({
      offset,
      limit: Math.min(MICROCMS_MAX_LIMIT, remaining),
      depth: 3 as const,
      filters: `publishedAt[equals]${publishedAt}`,
      orders: '-publishedAt',
    });

    if (totalCount === 0) {
      totalCount = response.totalCount;
    }

    if (!response.contents.length) {
      break;
    }

    contents.push(...response.contents);
    offset += response.contents.length;

    if (offset >= totalCount) {
      break;
    }
  }

  return { contents, totalCount };
};

export async function getArticlePosts(params: ArticlePostParams = {}): Promise<ArticleResponse> {
  try {
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
  } catch (error) {
    console.error('Error in getArticlePosts:', toSafeErrorLogContext(error));
    if (IS_PRODUCTION) {
      throw error;
    }

    return getEmptyArticleResponse();
  }
}

type GetArticlePostOptions = {
  draftKey?: string;
  contentId?: string;
};

export async function getArticlePost(
  slug: string,
  options: GetArticlePostOptions = {},
): Promise<ArticlePost | null> {
  try {
    const { draftKey, contentId } = options;

    if (draftKey && contentId) {
      const detail = await getDetail(
        contentId,
        { draftKey },
        { cacheMode: 'no-store' },
      );
      return adaptArticle(detail);
    }

    if (draftKey) {
      return fetchArticlePostFromApi(slug, { draftKey, cacheMode: 'no-store' });
    }

    return fetchArticlePostFromApi(slug, { cacheMode: 'revalidate' });
  } catch (error) {
    console.error(`Error in getArticlePost for slug ${slug}:`, toSafeErrorLogContext(error));
    if (IS_PRODUCTION) {
      throw error;
    }

    return null;
  }
}

export async function getAllTags(): Promise<Tag[]> {
  const allTags: Tag[] = [];
  let offset = 0;
  let totalCount = 0;

  while (totalCount === 0 || offset < totalCount) {
    const response = await getMicroCMSTags({
      offset,
      limit: MICROCMS_MAX_LIMIT,
    });

    if (totalCount === 0) {
      totalCount = response.totalCount;
    }

    if (!response.contents.length) {
      break;
    }

    allTags.push(...response.contents.map(adaptTag));
    offset += MICROCMS_MAX_LIMIT;
  }

  return allTags;
}

export async function getAllTagsSafe(): Promise<Tag[]> {
  try {
    return await getAllTags();
  } catch (error) {
    console.error('Error in getAllTagsSafe:', toSafeErrorLogContext(error));
    return [];
  }
}

export async function getAllArticles(): Promise<ArticlePost[]> {
  try {
    return await getAllArticlesCached();
  } catch (error) {
    console.error('Error in getAllArticles:', toSafeErrorLogContext(error));
    if (IS_PRODUCTION) {
      throw error;
    }

    return [];
  }
}

export async function getAdjacentArticles(
  currentPost: Pick<ArticlePost, 'id' | 'publishedAt'>,
): Promise<AdjacentArticles> {
  try {
    const { id: currentArticleId, publishedAt } = currentPost;

    const [newer, older, samePublishedAt] = await Promise.all([
      getListRawOrThrow({
        limit: 1,
        depth: 3 as const,
        filters: `publishedAt[greater_than]${publishedAt}`,
        orders: 'publishedAt',
      }),
      getListRawOrThrow({
        limit: 1,
        depth: 3 as const,
        filters: `publishedAt[less_than]${publishedAt}`,
        orders: '-publishedAt',
      }),
      getSamePublishedAtArticlesWithLimit(publishedAt),
    ]);

    if (samePublishedAt.totalCount > ADJACENT_SAME_PUBLISHED_AT_LIMIT) {
      logWarnEvent({
        event: 'adjacent_articles_same_published_at_limit_reached',
        reason: 'same_published_at_scan_limit',
        context: {
          limit: ADJACENT_SAME_PUBLISHED_AT_LIMIT,
          totalCount: samePublishedAt.totalCount,
        },
      });
    }

    const mergedMap = new Map<string, ArticlePost>();

    for (const article of [...newer.contents, ...samePublishedAt.contents, ...older.contents]) {
      const adapted = adaptArticle(article);
      mergedMap.set(adapted.id, adapted);
    }

    const mergedArticles = Array.from(mergedMap.values()).sort(compareByPublishedAtDescAndIdDesc);
    const currentIndex = mergedArticles.findIndex((article) => article.id === currentArticleId);

    if (currentIndex === -1) {
      return { prevPost: null, nextPost: null };
    }

    return {
      prevPost: currentIndex < mergedArticles.length - 1 ? mergedArticles[currentIndex + 1] : null,
      nextPost: currentIndex > 0 ? mergedArticles[currentIndex - 1] : null,
    };
  } catch (error) {
    console.error('Error in getAdjacentArticles:', toSafeErrorLogContext(error));
    return { prevPost: null, nextPost: null };
  }
}
