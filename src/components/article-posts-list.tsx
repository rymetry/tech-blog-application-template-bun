import { ArticleCard } from '@/components/article-card';
import { Pagination } from '@/components/pagination';
import { getArticlePosts } from '@/lib/api';
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

  const totalPages = Math.ceil(totalCount / limit);

  if (posts.length === 0) {
    return (
      <div className="text-center py-10 sm:py-12 border border-border/20 rounded-lg">
        <h3 className="text-xl sm:text-2xl font-medium">No posts found</h3>
        <p className="text-base sm:text-lg text-muted-foreground mt-2">
          Try adjusting your search or filter criteria
        </p>
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
