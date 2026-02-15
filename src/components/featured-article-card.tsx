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

export function FeaturedArticleCard({ post }: FeaturedArticleCardProps) {
  const featuredImageUrl = post.hasCoverImage
    ? getMicroCmsImageUrl(post.coverImage.url, { width: 1200, height: 630, fit: 'max' })
    : '/placeholder.svg';

  return (
    <Link
      href={`/articles/${post.slug}`}
      className="group block focus-visible:outline-none"
      aria-labelledby={`featured-article-title-${post.slug}`}
    >
      <Card className="overflow-hidden card-surface card-surface-hover group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 py-0">
        <div className="grid md:grid-cols-[1fr_2fr]">
          <div className="relative min-h-[180px] overflow-hidden md:min-h-[220px]">
            <Image
              src={featuredImageUrl}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="pointer-events-none object-cover scale-110 blur-2xl opacity-45"
            />
            <div className="absolute inset-0 bg-background/20" aria-hidden="true" />
            <Image
              src={featuredImageUrl}
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 33vw"
              quality={90}
              className="object-contain p-3"
            />
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
