import { ArticleCard } from '@/components/article-card';
import { getArticlePosts } from '@/lib/api';
import { PAGINATION_LIMITS } from '@/lib/constants';

export async function LatestPosts() {
  let latestPosts = [] as Awaited<ReturnType<typeof getArticlePosts>>['contents'];

  try {
    // microCMSのデフォルト順序と同じ並び順を明示的に指定する
    const response = await getArticlePosts({
      limit: PAGINATION_LIMITS.LATEST_POSTS,
      orders: '-publishedAt'
    });
    latestPosts = response.contents || [];
  } catch (error) {
    console.error('Error fetching article posts:', error);
  }

  if (!latestPosts || latestPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts available at the moment. Check back soon!</p>
      </div>
    );
  }

  return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
      {latestPosts.map((post) => (
        <ArticleCard
          key={post.id}
          post={post}
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 33vw, 400px"
        />
      ))}
    </div>
  );
}
