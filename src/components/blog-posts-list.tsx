import { BlogCard } from '@/components/blog-card';
import { Pagination } from '@/components/pagination';
import { getBlogPosts } from '@/lib/api';
import { Suspense } from 'react';

type SearchParams = {
  page?: string;
  tag?: string;
  q?: string;
};

export async function BlogPostsList({ searchParams }: { searchParams: SearchParams }) {
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const filters: string[] = [];
  if (searchParams.tag) {
    filters.push(`tags[contains]${searchParams.tag}`);
  }

  const { contents: posts, totalCount } = await getBlogPosts({
    offset,
    limit,
    filters: filters.length > 0 ? filters.join('[and]') : undefined,
    q: searchParams.q,
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
          <BlogCard key={post.id} post={post} priority={index < 2} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8">
          <Suspense fallback={<div className="text-center">Loading pagination...</div>}>
            <Pagination totalPages={totalPages} currentPage={page} />
          </Suspense>
        </div>
      )}
    </>
  );
}
