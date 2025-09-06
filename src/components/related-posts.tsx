import { RelatedPostCard } from '@/components/related-post-card';
import type { BlogPost } from '@/types';

export async function RelatedPosts({ relatedPosts }: { relatedPosts: BlogPost[] }) {
  if (!relatedPosts || relatedPosts.length === 0) return null;

  return (
    <section
      className="mt-12 sm:mt-16 pt-8 border-t dark:border-primary/30 border-primary/20 max-w-[1024px] mx-auto"
      aria-labelledby="related-posts-heading"
    >
      <h2
        id="related-posts-heading"
        className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center"
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
