import { TagPill } from '@/components/tag-pill';
import { Card } from '@/components/ui/card';
import { getMicroCmsImageUrl } from '@/lib/image';
import type { ArticlePost } from '@/types';
import { Tag as TagIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CompactArticleCardProps {
  post: ArticlePost;
}

export function CompactArticleCard({ post }: CompactArticleCardProps) {
  const compactImageUrl = post.hasCoverImage
    ? getMicroCmsImageUrl(post.coverImage.url, { width: 320, height: 180, fit: 'crop' })
    : '';

  return (
    <Link
      href={`/articles/${post.slug}`}
      className="group block h-full focus-visible:outline-none"
      aria-labelledby={`compact-article-title-${post.slug}`}
    >
      <Card className="article-compact-card h-full overflow-hidden card-surface card-surface-hover group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 py-0">
        <div className="flex h-full flex-col sm:flex-row sm:items-center">
          <div className="shrink-0 p-3 pb-0 sm:pb-3">
            {post.hasCoverImage ? (
              <div className="article-compact-card-media relative overflow-hidden rounded-lg">
                <Image
                  src={compactImageUrl}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 639px) calc(100vw - 24px), (max-width: 767px) 148px, 168px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div
                className="article-compact-card-media article-hero-cover-placeholder rounded-lg"
                aria-hidden="true"
              />
            )}
          </div>
          <div className="flex min-w-0 flex-1 p-3 pt-2 sm:py-3 sm:pr-3 sm:pl-0">
            <div className="space-y-2">
              <h3
                id={`compact-article-title-${post.slug}`}
                className="article-compact-title break-words group-hover:text-primary transition-colors"
              >
                {post.title}
              </h3>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5" aria-label="Tags">
                  {post.tags.slice(0, 2).map((tag, index) => (
                    <TagPill key={tag.id} className={index === 1 ? 'hidden sm:inline-flex' : undefined}>
                      <TagIcon className="h-3 w-3" aria-hidden="true" />
                      {tag.name}
                    </TagPill>
                  ))}
                  {post.tags.length > 1 && (
                    <TagPill
                      variant="neutral"
                      size="md"
                      title={`${post.tags.length - 1} more tags`}
                      aria-label={`+${post.tags.length - 1} more tags`}
                      className="cursor-default sm:hidden"
                    >
                      +{post.tags.length - 1}
                    </TagPill>
                  )}
                  {post.tags.length > 2 && (
                    <TagPill
                      variant="neutral"
                      size="md"
                      title={`${post.tags.length - 2} more tags`}
                      aria-label={`+${post.tags.length - 2} more tags`}
                      className="hidden cursor-default sm:inline-flex"
                    >
                      +{post.tags.length - 2}
                    </TagPill>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
