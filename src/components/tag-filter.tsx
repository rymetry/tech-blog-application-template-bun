'use client';

import type { Tag } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { TagPill } from '@/components/tag-pill';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  tags: Tag[];
}

export function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTag = searchParams.get('tag');
  const isAllSelected = !currentTag;

  const handleTagClick = useCallback(
    (tagId: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (currentTag === tagId) {
        params.delete('tag');
      } else {
        params.set('tag', tagId);
      }

      const query = params.toString();
      router.push(query ? `/articles?${query}` : '/articles');
    },
    [currentTag, router, searchParams],
  );

  const handleAllClick = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tag');
    const query = params.toString();
    router.push(query ? `/articles?${query}` : '/articles');
  }, [router, searchParams]);

  const renderedTags = useMemo(() => {
    const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));
    const items = sortedTags.map((tag) => {
      const isSelected = currentTag === tag.id;
      return (
        <TagPill
          key={tag.id}
          asChild
          variant={isSelected ? 'selected' : 'muted'}
          size="md"
          className={cn(isSelected ? '' : 'hover:text-foreground hover:border-primary/30')}
        >
          <button
            onClick={() => handleTagClick(tag.id)}
            className="cursor-pointer"
            aria-pressed={isSelected}
            aria-label={`Filter by tag: ${tag.name}`}
          >
            {tag.name}
          </button>
        </TagPill>
      );
    });

    return [
      <TagPill
        key="all-tags"
        asChild
        variant={isAllSelected ? 'selected' : 'muted'}
        size="md"
        className={cn(isAllSelected ? '' : 'hover:text-foreground hover:border-primary/30')}
      >
        <button
          onClick={handleAllClick}
          className="cursor-pointer"
          aria-pressed={isAllSelected}
          aria-label="Show all tags"
        >
          All
        </button>
      </TagPill>,
      ...items,
    ];
  }, [tags, currentTag, handleTagClick, handleAllClick, isAllSelected]);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter articles by tag">
      {renderedTags}
    </div>
  );
}
