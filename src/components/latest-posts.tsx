import { BlogCard } from '@/components/blog-card';
import { getPosts } from '@/lib/cms';
import type { BlogPost } from '@/types';

export async function LatestPosts() {
  let latestPosts: BlogPost[] = [];

  try {
    const response = await getPosts({ limit: 3 });
    latestPosts = response.items;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
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
        <BlogCard key={post.slug} post={post} priority={index === 0} />
      ))}
    </div>
  );
}
