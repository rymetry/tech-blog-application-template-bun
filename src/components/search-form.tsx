'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildArticlesPath } from '@/lib/utils';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      router.push(
        buildArticlesPath(
          searchParams,
          { q: query.trim() || undefined },
          { resetPage: true },
        ),
      );
    },
    [query, router, searchParams],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
      role="search"
      aria-label="Search writing"
    >
      <div className="relative flex-1">
        <Search
          className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search writing..."
          value={query}
          onChange={handleChange}
          maxLength={100}
          className="pl-8 bg-background border-primary/20 focus:border-primary/50 focus:ring-primary/30 form-input"
          aria-label="Search writing"
        />
      </div>
      <Button type="submit" size="sm" className="w-full sm:w-auto sm:shrink-0 btn-text">
        Search
      </Button>
    </form>
  );
}
