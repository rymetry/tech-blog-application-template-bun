import { BlogCard } from '@/components/blog-card';
import { getBlogPosts } from '@/lib/api';
import type { BlogPost } from '@/types';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';

export async function PrevNextPosts({ postId }: { postId: string }) {
  let prevPost: BlogPost | null = null;
  let nextPost: BlogPost | null = null;

  try {
    const { contents: allPosts } = await getBlogPosts({ limit: 100 });
    const currentIndex = allPosts.findIndex((p) => p.id === postId);
    prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
    nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  } catch (error) {
    console.error('Error fetching related posts:', error);
  }

  return (
    <nav
      className="mt-12 sm:mt-16 pt-8 border-t dark:border-primary/30 border-primary/20 max-w-[1024px] mx-auto"
      aria-labelledby="pagination-heading"
    >
      <h2
        id="pagination-heading"
        className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center"
      >
        Continue Reading
      </h2>
      <div className="flex justify-between">
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-medium mb-3 flex gap-2 items-center text-primary">
            <BsArrowLeft className="h-4 w-4" aria-hidden="true" />
            Previous Article
          </h3>
        </div>
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-medium mb-3 flex gap-2 items-center justify-end text-primary">
            Next Article
            <BsArrowRight className="h-4 w-4" aria-hidden="true" />
          </h3>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prevPost ? (
          <div className="md:col-start-1">
            <BlogCard post={prevPost} />
          </div>
        ) : (
          <div className="md:col-start-1">
            <p className="text-muted-foreground text-center py-8">No previous articles</p>
          </div>
        )}

        {nextPost ? (
          <div className="md:col-start-2">
            <BlogCard post={nextPost} />
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
