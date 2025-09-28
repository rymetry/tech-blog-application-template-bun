'use client';

import { Author } from '@/components/author';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { BlogPost } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { BsArrowClockwise, BsCalendar2Check, BsTag } from 'react-icons/bs';

interface RelatedPostCardProps {
  post: BlogPost;
}

export const RelatedPostCard = React.memo(function RelatedPostCard({ post }: RelatedPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block max-w-[830px] mx-auto w-full focus-visible:outline-none"
      aria-labelledby={`related-title-${post.slug}`}
    >
      <Card className="h-full overflow-hidden border-border/30 bg-card/60 hover:border-primary/50 focus-within:border-primary/50 transition-all duration-300 group-hover:scale-98 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 shadow-sm py-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-[330px] overflow-hidden">
            <div className="aspect-[8/5] w-full">
              <Image
                src={post.coverImage.url || '/placeholder.svg'}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 640px) 100vw, 330px"
                loading="lazy"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
          <div className="p-4 sm:p-5 flex flex-col justify-between sm:flex-1">
            <div>
              <h3
                id={`related-title-${post.slug}`}
                className="card-title group-hover:text-primary transition-colors line-clamp-2 mb-2"
              >
                {post.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3" aria-label="Tags">
                {post.tags && post.tags.length > 0 && (
                  <>
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag.id}
                        className="tag-text bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BsTag className="h-3 w-3" aria-hidden="true" />
                        {tag.name}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="tag-text bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-full">
                        +{post.tags.length - 2}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-between items-center gap-2 mt-auto pt-2">
              {post.author && post.author.name ? (
                <Author author={post.author} size="sm" compact />
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs"
                    aria-hidden="true"
                  >
                    A
                  </div>
                  <span className="text-sm font-medium">Anonymous</span>
                </div>
              )}
              <div className="flex flex-col gap-1 items-end card-meta">
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
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
});
