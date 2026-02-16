import { ArticleCard } from '@/components/article-card';
import { FeaturedArticleCard } from '@/components/featured-article-card';
import { Pagination } from '@/components/pagination';
import { TagPill } from '@/components/tag-pill';
import { normalizeArticlesQuery, type RawArticlesQuery } from '@/lib/articles-query';
import { getArticlePosts } from '@/lib/api';
import { PAGINATION_LIMITS } from '@/lib/constants';
import { getTagsByIdMapSafe } from '@/lib/tags-map';

export async function ArticlePostsList({ searchParams }: { searchParams: RawArticlesQuery }) {
  const tagsById = await getTagsByIdMapSafe();
  const normalizeOptions =
    tagsById.size > 0
      ? { validTagIds: new Set(tagsById.keys()) }
      : {};
  const query = normalizeArticlesQuery(searchParams, normalizeOptions);
  const page = query.page;
  const limit = PAGINATION_LIMITS.ARTICLES_LIST;
  const offset = (page - 1) * limit;
  const shouldShowFeatured = page === 1 && !query.tag && !query.q;

  const filters: string[] = [];
  if (query.tag) {
    filters.push(`tags[contains]${query.tag}`);
  }

  // NOTE: MicroCMSのデフォルト順序と同じ順序を明示的に指定
  const { contents: posts, totalCount } = await getArticlePosts({
    offset,
    limit,
    filters: filters.length > 0 ? filters.join('[and]') : undefined,
    q: query.q,
    orders: '-publishedAt',
  });

  const tagLabel = query.tag ? tagsById.get(query.tag) : undefined;

  const totalPages = Math.ceil(totalCount / limit);
  const activeFilters = [
    ...(query.q ? [{ key: 'q', label: `Search: ${query.q}` }] : []),
    ...(query.tag
      ? [{ key: 'tag', label: `Tag: ${tagLabel ?? query.tag}` }]
      : []),
  ];

  if (posts.length === 0) {
    return (
      <div className="text-center py-10 sm:py-12 border border-border/20 rounded-lg">
        <h3 className="text-xl sm:text-2xl font-medium">No posts found</h3>
        <p className="text-base sm:text-lg text-muted-foreground mt-2">
          Try adjusting your search or filter criteria
        </p>
        {activeFilters.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">Active filters</p>
            <div className="flex flex-wrap justify-center gap-2">
              {activeFilters.map((filter) => (
                <TagPill key={filter.key} variant="muted" className="cursor-default">
                  {filter.label}
                </TagPill>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const featuredPost = shouldShowFeatured ? posts[0] : null;
  const listPosts = shouldShowFeatured ? posts.slice(1) : posts;

  return (
    <>
      {featuredPost && (
        <div className="mb-8">
          <FeaturedArticleCard post={featuredPost} />
        </div>
      )}
      {listPosts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {listPosts.map((post, index) => (
            <ArticleCard
              key={post.id}
              post={post}
              priority={index < 2}
              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 480px"
            />
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination totalPages={totalPages} currentPage={page} />
        </div>
      )}
    </>
  );
}
