import { CompactArticleCard } from '@/components/compact-article-card';
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
    // NOTE: getAllArticles()を使用して全記事を取得し、インデックスベースで前後記事を特定
    // パフォーマンスに関する考慮事項:
    // - getAllArticles()はNext.jsのISR + unstable_cacheでキャッシュされている（5分間）
    // - 実際のAPIコールは5分ごとに1回のみ、それ以外はキャッシュから読み込み
    // - メモリ使用量: 1000記事でも約1MB以下（現代の環境では無視できるレベル）
    // - 代替案（MicroCMSフィルター）は複雑で、publishedAtの重複による不具合の原因となった
    // - インデックスベースのアプローチは単純で信頼性が高く、記事数が数千以下なら十分スケール可能
    const allPosts = await getAllArticles();
    const currentIndex = allPosts.findIndex((p) => p.slug === postSlug);
    if (currentIndex === -1) {
      // 理論上発生しないはずだが、万が一発生した場合はキャッシュ不整合などの重大なバグの可能性
      console.error(`[PrevNextPosts] Critical: Article slug "${postSlug}" exists in detail but not in list. Possible cache inconsistency.`);
      return null;
    }
    prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
    nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  } catch (error) {
    console.error('Error fetching adjacent posts:', error);
  }

  return (
    <nav
      className="mt-12 sm:mt-16 pt-8 border-t dark:border-primary/30 border-primary/20 w-full"
      aria-labelledby="pagination-heading"
    >
      <h2
        id="pagination-heading"
        className="font-bold mb-6 text-left tracking-tight"
      >
        Continue Reading
      </h2>
      <div className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 md:gap-y-6">
        <div className="h-full space-y-4 md:col-start-1 md:space-y-3">
          <h3 className="flex items-center gap-2 text-base font-medium tracking-tight text-primary sm:text-lg md:text-xl">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Previous Article
          </h3>
          {prevPost ? (
            <CompactArticleCard post={prevPost} />
          ) : (
            <div className="flex h-full min-h-[108px] items-center justify-center rounded-xl border border-dashed border-border/40 bg-card/30 p-4 text-center text-muted-foreground">
              No previous articles
            </div>
          )}
        </div>

        <div className="h-full space-y-4 pt-2 sm:pt-3 md:col-start-2 md:space-y-3 md:pt-0">
          <h3 className="flex items-center gap-2 text-base font-medium tracking-tight text-primary sm:text-lg md:justify-end md:text-right md:text-xl">
            Next Article
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </h3>
          {nextPost ? (
            <CompactArticleCard post={nextPost} />
          ) : (
            <div className="flex h-full min-h-[108px] items-center justify-center rounded-xl border border-dashed border-border/40 bg-card/30 p-4 text-center text-muted-foreground">
              No newer articles
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
