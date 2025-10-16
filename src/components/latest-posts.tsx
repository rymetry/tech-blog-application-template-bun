import { ArticleCard } from '@/components/article-card';
import { getArticlePosts } from '@/lib/api';

export async function LatestPosts() {
  let latestPosts = [] as Awaited<ReturnType<typeof getArticlePosts>>['contents'];

  try {
    const response = await getArticlePosts({ limit: 3 });
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
      {latestPosts.map((post, index) => (
        <ArticleCard key={post.id} post={post} priority={index === 0} />
      ))}
    </div>
  );
}
