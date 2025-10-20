'use client';

import { cn } from '@/lib/utils';
import type { Tag } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Tag as TagIcon } from 'lucide-react';

interface TagFilterProps {
  tags: Tag[];
}

export function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTag = searchParams.get('tag');

  const handleTagClick = useCallback(
    (tagId: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (currentTag === tagId) {
        params.delete('tag');
      } else {
        params.set('tag', tagId);
      }

      router.push(`/articles?${params.toString()}`);
    },
    [currentTag, router, searchParams],
  );

  const renderedTags = useMemo(() => {
    return tags.map((tag) => {
      const isSelected = currentTag === tag.id;
      return (
        <button
          key={tag.id}
          onClick={() => handleTagClick(tag.id)}
          className={cn(
            'tag-text px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer',
            isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary/10 text-primary hover:bg-primary/20',
          )}
          aria-pressed={isSelected}
          aria-label={`Filter by tag: ${tag.name}`}
        >
          <TagIcon className="h-3 w-3" aria-hidden="true" />
          {tag.name}
        </button>
      );
    });
  }, [tags, currentTag, handleTagClick]);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter articles by tag">
      {renderedTags}
    </div>
  );
}
