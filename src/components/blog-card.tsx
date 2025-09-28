import { Author } from '@/components/author';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { BlogPost } from '@/types';
import { FallbackImage } from '@/components/fallback-image';
import Link from 'next/link';
import { BsArrowClockwise, BsCalendar2Check, BsTag } from 'react-icons/bs';

interface BlogCardProps {
  post: BlogPost;
  priority?: boolean;
}

export function BlogCard({ post, priority = false }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.id}`}
      className="group block focus-visible:outline-none h-full"
      aria-labelledby={`blog-title-${post.id}`}
    >
      <Card className="h-full overflow-hidden border-border/30 bg-card/60 hover:border-primary/50 focus-within:border-primary/50 transition-all duration-300 group-hover:scale-98 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 shadow-sm py-0">
        <div className="relative w-full aspect-[8/5] overflow-hidden">
          <FallbackImage
            src={post.coverImage.url || '/placeholder.svg'}
            alt={post.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4 space-y-3">
          <h3
            id={`blog-title-${post.id}`}
            className="card-title group-hover:text-primary transition-colors line-clamp-2"
          >
            {post.title}
          </h3>
          <div className="flex flex-wrap gap-2" aria-label="Tags">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="tag-text bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                <BsTag className="h-3 w-3" aria-hidden="true" />
                {tag.name}
              </span>
            ))}
            {post.tags.length > 2 && (
              <span className="tag-text bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-full flex items-center gap-1">
                +{post.tags.length - 2}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-start card-meta">
          <Author author={post.author} size="sm" compact />
          <div className="flex flex-col gap-1 items-end">
            <div className="flex items-center gap-1">
              <BsCalendar2Check className="h-3 w-3" aria-hidden="true" />
              <time
                dateTime={post.publishedAt}
                aria-label={`Published on ${formatDate(post.publishedAt)}`}
              >
                {formatDate(post.publishedAt)}
              </time>
            </div>
            <div className="flex items-center gap-1">
              <BsArrowClockwise className="h-3 w-3" aria-hidden="true" />
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
