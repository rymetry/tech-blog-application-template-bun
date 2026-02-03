'use client';

import type { Tag } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Tag as TagIcon } from 'lucide-react';
import { TagPill } from '@/components/tag-pill';

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
    const items = tags.map((tag) => {
      const isSelected = currentTag === tag.id;
      return (
        <TagPill
          key={tag.id}
          asChild
          variant={isSelected ? 'selected' : 'primary'}
          size="md"
        >
          <button
            onClick={() => handleTagClick(tag.id)}
            className="cursor-pointer"
            aria-pressed={isSelected}
            aria-label={`Filter by tag: ${tag.name}`}
          >
            <TagIcon className="h-3 w-3" aria-hidden="true" />
            {tag.name}
          </button>
        </TagPill>
      );
    });

    return [
      <TagPill
        key="all-tags"
        asChild
        variant={isAllSelected ? 'selected' : 'primary'}
        size="md"
      >
        <button
          onClick={handleAllClick}
          className="cursor-pointer"
          aria-pressed={isAllSelected}
          aria-label="Show all tags"
        >
          <TagIcon className="h-3 w-3" aria-hidden="true" />
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
