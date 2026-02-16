'use client';

import type { Tag } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { TagPill } from '@/components/tag-pill';
import { buildArticlesPath, cn } from '@/lib/utils';

interface TagFilterProps {
  tags: Tag[];
}

export function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTag = searchParams.get('tag');
  const validTagIds = useMemo(() => new Set(tags.map((tag) => tag.id)), [tags]);
  const normalizedCurrentTag = currentTag && validTagIds.has(currentTag) ? currentTag : undefined;
  const isAllSelected = !normalizedCurrentTag;

  const handleTagClick = useCallback(
    (tagId: string) => {
      const nextTag = normalizedCurrentTag === tagId ? undefined : tagId;
      router.push(
        buildArticlesPath(searchParams, { tag: nextTag }, { resetPage: true }),
      );
    },
    [normalizedCurrentTag, router, searchParams],
  );

  const handleAllClick = useCallback(() => {
    router.push(
      buildArticlesPath(searchParams, { tag: undefined }, { resetPage: true }),
    );
  }, [router, searchParams]);

  const renderedTags = useMemo(() => {
    const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));
    const items = sortedTags.map((tag) => {
      const isSelected = normalizedCurrentTag === tag.id;
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
  }, [tags, normalizedCurrentTag, handleTagClick, handleAllClick, isAllSelected]);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter articles by tag">
      {renderedTags}
    </div>
  );
}
