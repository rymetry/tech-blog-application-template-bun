import { adaptArticle } from '@/lib/adapters';
import {
  MICROCMS_CACHE_TAGS,
  MICROCMS_REVALIDATE_SECONDS,
  getListRawOrThrow,
} from '@/lib/microcms';
import type { ArticlePost } from '@/types';
import { unstable_cache } from 'next/cache';

const MICROCMS_MAX_LIMIT = 100;

const fetchAllArticlesUncached = async (): Promise<ArticlePost[]> => {
  const allArticles: ArticlePost[] = [];
  let offset = 0;
  let totalCount = 0;

  while (totalCount === 0 || offset < totalCount) {
    const response = await getListRawOrThrow({
      offset,
      limit: MICROCMS_MAX_LIMIT,
      depth: 3 as const,
      orders: '-publishedAt',
    });

    if (totalCount === 0) {
      totalCount = response.totalCount;
    }

    if (!response.contents.length) {
      break;
    }

    allArticles.push(...response.contents.map(adaptArticle));
    offset += MICROCMS_MAX_LIMIT;
  }

  return allArticles;
};

export const getAllArticlesCached = unstable_cache(fetchAllArticlesUncached, ['articles:all'], {
  revalidate: MICROCMS_REVALIDATE_SECONDS,
  tags: ['microcms', MICROCMS_CACHE_TAGS.ARTICLES],
});
