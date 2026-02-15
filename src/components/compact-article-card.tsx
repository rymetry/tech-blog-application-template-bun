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
    ? getMicroCmsImageUrl(post.coverImage.url, { width: 240, height: 240, fit: 'max' })
    : '';

  return (
    <Link
      href={`/articles/${post.slug}`}
      className="group block h-full focus-visible:outline-none"
      aria-labelledby={`compact-article-title-${post.slug}`}
    >
      <Card className="article-compact-card h-full min-h-[132px] overflow-hidden card-surface card-surface-hover group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 py-0">
        <div className="flex h-full items-center gap-4 p-4">
          <div className="shrink-0">
            {post.hasCoverImage ? (
              <div className="article-compact-card-media relative overflow-hidden">
                <Image
                  src={compactImageUrl}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="100px"
                  className="pointer-events-none object-cover scale-110 blur-xl opacity-45"
                />
                <div className="absolute inset-0 bg-background/20" aria-hidden="true" />
                <Image
                  src={compactImageUrl}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="100px"
                  quality={90}
                  className="object-contain p-1.5"
                />
              </div>
            ) : (
              <div
                className="article-compact-card-media article-hero-cover-placeholder"
                aria-hidden="true"
              />
            )}
          </div>
          <div className="flex min-w-0 flex-1">
            <div className="space-y-3">
              <h3
                id={`compact-article-title-${post.slug}`}
                className="card-title-sm break-words group-hover:text-primary transition-colors"
              >
                {post.title}
              </h3>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5" aria-label="Tags">
                  {post.tags.slice(0, 2).map((tag) => (
                    <TagPill key={tag.id}>
                      <TagIcon className="h-3 w-3" aria-hidden="true" />
                      {tag.name}
                    </TagPill>
                  ))}
                  {post.tags.length > 2 && (
                    <TagPill
                      variant="neutral"
                      size="md"
                      title={`${post.tags.length - 2} more tags`}
                      aria-label={`+${post.tags.length - 2} more tags`}
                      className="cursor-default"
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
