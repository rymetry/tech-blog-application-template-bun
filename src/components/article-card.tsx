import { Author } from '@/components/author';
import { TagPill } from '@/components/tag-pill';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getMicroCmsImageUrl } from '@/lib/image';
import { formatDate } from '@/lib/utils';
import type { ArticlePost } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarCheck, RefreshCcw, Tag } from 'lucide-react';

interface ArticleCardProps {
  post: ArticlePost;
  sizes?: string;
}

const DEFAULT_CARD_IMAGE_SIZES =
  '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 420px';

export function ArticleCard({ post, sizes = DEFAULT_CARD_IMAGE_SIZES }: ArticleCardProps) {
  const coverImageUrl = post.coverImage.url || '/placeholder.svg';
  const mainImageUrl = getMicroCmsImageUrl(coverImageUrl, { width: 960, height: 600, fit: 'crop' });

  return (
    <Link
      href={`/articles/${post.slug}`}
      className="group block focus-visible:outline-none h-full"
      aria-labelledby={`article-title-${post.slug}`}
    >
      <Card className="h-full overflow-hidden card-surface card-surface-hover group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 py-0">
        <div className="relative w-full aspect-[8/5] overflow-hidden">
          <Image
            src={mainImageUrl}
            alt=""
            aria-hidden="true"
            fill
            sizes={sizes}
            className="object-cover object-center"
          />
        </div>
        <CardContent className="p-4 space-y-3">
          <h3
            id={`article-title-${post.slug}`}
            className="card-title-sm break-words group-hover:text-primary transition-colors"
          >
            {post.title}
          </h3>
          <div className="flex flex-wrap gap-2" aria-label="Tags">
            {post.tags.slice(0, 2).map((tag) => (
              <TagPill
                key={tag.id}
              >
                <Tag className="h-3 w-3" aria-hidden="true" />
                {tag.name}
              </TagPill>
            ))}
            {post.tags.length > 2 && (
              <TagPill
                variant="neutral"
                size="md"
                title={`${post.tags.length - 2} more tags`}
                aria-label={`+${post.tags.length - 2} more tags`}
              >
                +{post.tags.length - 2}
              </TagPill>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-start card-meta">
          <Author author={post.author} size="sm" compact />
          <div className="flex flex-col gap-1 items-end">
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
        </CardFooter>
      </Card>
    </Link>
  );
}
