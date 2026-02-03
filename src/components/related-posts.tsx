import { RelatedPostCard } from '@/components/related-post-card';
import type { ArticlePost } from '@/types';

export async function RelatedPosts({ relatedPosts }: { relatedPosts: ArticlePost[] }) {
  if (!relatedPosts || relatedPosts.length === 0) return null;

  return (
    <section
      className="mt-12 sm:mt-16 pt-8 border-t dark:border-primary/30 border-primary/20 max-w-[1024px] mx-auto"
      aria-labelledby="related-posts-heading"
    >
      <h2
        id="related-posts-heading"
        className="font-bold mb-6 text-left tracking-tight"
      >
        Related Posts
      </h2>
      <div className="flex flex-col gap-4">
        {relatedPosts.map((relatedPost) => (
          <RelatedPostCard key={relatedPost.id} post={relatedPost} />
        ))}
      </div>
    </section>
  );
}
