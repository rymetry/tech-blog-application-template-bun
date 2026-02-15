import { CompactArticleCard } from '@/components/compact-article-card';
import type { ArticlePost } from '@/types';

export async function RelatedPosts({ relatedPosts }: { relatedPosts: ArticlePost[] }) {
  if (!relatedPosts || relatedPosts.length === 0) return null;

  return (
    <section
      className="mt-12 sm:mt-16 pt-8 border-t dark:border-primary/30 border-primary/20 max-w-[1024px] mx-auto w-full"
      aria-labelledby="related-posts-heading"
    >
      <h2
        id="related-posts-heading"
        className="font-bold mb-6 text-left tracking-tight"
      >
        Related Posts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedPosts.map((relatedPost) => (
          <div key={relatedPost.id} className="h-full">
            <CompactArticleCard post={relatedPost} />
          </div>
        ))}
      </div>
    </section>
  );
}
