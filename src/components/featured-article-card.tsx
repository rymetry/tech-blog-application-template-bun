import { Author } from '@/components/author';
import { TagPill } from '@/components/tag-pill';
import { Card } from '@/components/ui/card';
import { getMicroCmsImageUrl } from '@/lib/image';
import { formatDate } from '@/lib/utils';
import type { ArticlePost } from '@/types';
import { CalendarCheck, RefreshCcw, Tag as TagIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface FeaturedArticleCardProps {
  post: ArticlePost;
}

const FEATURED_IMAGE_SIZES =
  '(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 360px), (max-width: 1279px) calc((100vw - 384px) * 0.4), 380px';

export function FeaturedArticleCard({ post }: FeaturedArticleCardProps) {
  const featuredImageUrl = post.hasCoverImage
    ? getMicroCmsImageUrl(post.coverImage.url, {
        width: 1200,
        height: 675,
        fit: 'crop',
      })
    : '/placeholder.svg';

  return (
    <Link
      href={`/articles/${post.slug}`}
      className="group block focus-visible:outline-none"
      aria-labelledby={`featured-article-title-${post.slug}`}
    >
      <Card className="overflow-hidden card-surface card-surface-hover group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 py-0">
        <div className="grid lg:grid-cols-[2fr_3fr]">
          <div className="p-4 pb-0 lg:pb-4">
            <div className="relative w-full overflow-hidden aspect-[16/9] lg:aspect-auto lg:h-full rounded-lg">
              <Image
                src={featuredImageUrl}
                alt=""
                aria-hidden="true"
                fill
                loading="eager"
                fetchPriority="high"
                sizes={FEATURED_IMAGE_SIZES}
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 p-5 sm:p-6">
            <div className="space-y-3">
              <h3
                id={`featured-article-title-${post.slug}`}
                className="card-title-lg group-hover:text-primary transition-colors line-clamp-2"
              >
                {post.title}
              </h3>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2" aria-label="Tags">
                  {post.tags.slice(0, 3).map((tag) => (
                    <TagPill key={tag.id}>
                      <TagIcon className="h-3 w-3" aria-hidden="true" />
                      {tag.name}
                    </TagPill>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <Author author={post.author} size="sm" compact />
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <CalendarCheck className="h-3 w-3" aria-hidden="true" />
                  <time
                    dateTime={post.publishedAt}
                    aria-label={`Published on ${formatDate(post.publishedAt)}`}
                  >
                    {formatDate(post.publishedAt)}
                  </time>
                </div>
                <div className="flex items-center gap-1">
                  <RefreshCcw className="h-3 w-3" aria-hidden="true" />
                  <time
                    dateTime={post.updatedAt}
                    aria-label={`Updated on ${formatDate(post.updatedAt)}`}
                  >
                    {formatDate(post.updatedAt)}
                  </time>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
