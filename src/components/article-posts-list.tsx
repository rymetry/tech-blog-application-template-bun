import { ArticleCard } from '@/components/article-card';
import { Pagination } from '@/components/pagination';
import { TagPill } from '@/components/tag-pill';
import { getArticlePosts, getTags } from '@/lib/api';
import { PAGINATION_LIMITS } from '@/lib/constants';

type SearchParams = {
  page?: string;
  tag?: string;
  q?: string;
};

export async function ArticlePostsList({ searchParams }: { searchParams: SearchParams }) {
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1;
  const limit = PAGINATION_LIMITS.ARTICLES_LIST;
  const offset = (page - 1) * limit;

  const filters: string[] = [];
  if (searchParams.tag) {
    filters.push(`tags[contains]${searchParams.tag}`);
  }

  // NOTE: MicroCMSのデフォルト順序と同じ順序を明示的に指定
  const { contents: posts, totalCount } = await getArticlePosts({
    offset,
    limit,
    filters: filters.length > 0 ? filters.join('[and]') : undefined,
    q: searchParams.q,
    orders: '-publishedAt',
  });

  let tagLabel: string | undefined;
  if (searchParams.tag) {
    try {
      const { contents } = await getTags();
      tagLabel = contents.find((tag) => tag.id === searchParams.tag)?.name;
    } catch (error) {
      console.error('Error resolving tag label:', error);
    }
  }

  const totalPages = Math.ceil(totalCount / limit);
  const activeFilters = [
    ...(searchParams.q ? [{ key: 'q', label: `Search: ${searchParams.q}` }] : []),
    ...(searchParams.tag
      ? [{ key: 'tag', label: `Tag: ${tagLabel ?? searchParams.tag}` }]
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

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {posts.map((post, index) => (
          <ArticleCard key={post.id} post={post} priority={index < 2} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination totalPages={totalPages} currentPage={page} />
        </div>
      )}
    </>
  );
}
