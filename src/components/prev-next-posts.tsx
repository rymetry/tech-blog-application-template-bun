import { ArticleCard } from '@/components/article-card';
import { getAllArticles } from '@/lib/api';
import type { ArticlePost } from '@/types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PrevNextPostsProps {
  postSlug: string;
}

export async function PrevNextPosts({ postSlug }: PrevNextPostsProps) {
  let prevPost: ArticlePost | null = null;
  let nextPost: ArticlePost | null = null;

  try {
    // NOTE: getAllArticles()を使用して全記事を取得
    // publishedAtで明示的にソートされ、一貫した順序を保証
    const allPosts = await getAllArticles();
    const currentIndex = allPosts.findIndex((p) => p.slug === postSlug);
    if (currentIndex === -1) {
      // 記事が見つからない場合は何も表示しない
      return null;
    }
    prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
    nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  } catch (error) {
    console.error('Error fetching adjacent posts:', error);
  }

  return (
    <nav
      className="mt-12 sm:mt-16 pt-8 border-t dark:border-primary/30 border-primary/20 max-w-[1024px] mx-auto"
      aria-labelledby="pagination-heading"
    >
      <h2
        id="pagination-heading"
        className="font-bold mb-6 text-center tracking-tight"
      >
        Continue Reading
      </h2>
      <div className="flex justify-between">
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-medium mb-3 flex gap-2 items-center text-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Previous Article
          </h3>
        </div>
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-medium mb-3 flex gap-2 items-center justify-end text-primary">
            Next Article
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </h3>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prevPost ? (
          <div className="md:col-start-1">
            <ArticleCard post={prevPost} />
          </div>
        ) : (
          <div className="md:col-start-1">
            <p className="text-muted-foreground text-center py-8">No previous articles</p>
          </div>
        )}

        {nextPost ? (
          <div className="md:col-start-2">
            <ArticleCard post={nextPost} />
          </div>
        ) : (
          <div className="md:col-start-2">
            <p className="text-muted-foreground text-center py-8">No newer articles</p>
          </div>
        )}
      </div>
    </nav>
  );
}
