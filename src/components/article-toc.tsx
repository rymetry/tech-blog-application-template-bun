'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { TocItem } from '@/lib/toc';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

interface ArticleTocProps {
  items: TocItem[];
  readingScopeId?: string;
}

interface TocOffsets {
  scroll: number;
  active: number;
}

type TocSegmentState = 'done' | 'current' | 'upcoming';

const FALLBACK_SCROLL_OFFSET_PX = 96;
const FALLBACK_ACTIVE_OFFSET_PX = 160;

function resolveCssPixelValue(variableName: string, fallback: number) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const variableValue = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  const parsedValue = Number.parseFloat(variableValue);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function readTocOffsets(): TocOffsets {
  return {
    scroll: resolveCssPixelValue('--article-toc-scroll-offset', FALLBACK_SCROLL_OFFSET_PX),
    active: resolveCssPixelValue('--article-toc-active-offset', FALLBACK_ACTIVE_OFFSET_PX),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ArticleToc({ items, readingScopeId = 'article-reading-scope' }: ArticleTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const [readingProgress, setReadingProgress] = useState(0);
  const [offsets, setOffsets] = useState<TocOffsets>({
    scroll: FALLBACK_SCROLL_OFFSET_PX,
    active: FALLBACK_ACTIVE_OFFSET_PX,
  });

  useEffect(() => {
    setActiveId(items[0]?.id ?? '');
  }, [items]);

  useEffect(() => {
    const syncOffsets = () => {
      const nextOffsets = readTocOffsets();

      setOffsets((currentOffsets) => {
        if (
          currentOffsets.scroll === nextOffsets.scroll &&
          currentOffsets.active === nextOffsets.active
        ) {
          return currentOffsets;
        }

        return nextOffsets;
      });
    };

    syncOffsets();
    window.addEventListener('resize', syncOffsets, { passive: true });

    return () => {
      window.removeEventListener('resize', syncOffsets);
    };
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (headings.length === 0) {
      return;
    }

    const updateActiveByViewport = () => {
      const passedHeadings = headings.filter(
        (heading) => heading.getBoundingClientRect().top <= offsets.active + 1,
      );

      if (passedHeadings.length > 0) {
        const nearestPassed = passedHeadings[passedHeadings.length - 1];
        setActiveId(nearestPassed.id);
        return;
      }

      const nearestUpcoming = headings.find(
        (heading) => heading.getBoundingClientRect().top > offsets.active,
      );

      setActiveId(nearestUpcoming?.id ?? headings[0].id);
    };

    const handleScroll = () => {
      updateActiveByViewport();
    };

    const observer = new IntersectionObserver(
      () => {
        updateActiveByViewport();
      },
      {
        rootMargin: `-${offsets.active}px 0px -65% 0px`,
        threshold: [0, 0.5, 1],
      },
    );

    headings.forEach((heading) => observer.observe(heading));
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    updateActiveByViewport();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [items, offsets.active]);

  useEffect(() => {
    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;

    const updateReadingProgress = () => {
      const scopeEl = document.getElementById(readingScopeId);
      if (!scopeEl) {
        setReadingProgress((current) => (current === 0 ? current : 0));
        return;
      }

      const rect = scopeEl.getBoundingClientRect();
      const readLine = window.scrollY + offsets.active;
      const scopeTop = rect.top + window.scrollY - offsets.scroll;
      const scopeBottom = rect.bottom + window.scrollY;
      const ratio = clamp(
        (readLine - scopeTop) / Math.max(scopeBottom - scopeTop, 1),
        0,
        1,
      );
      const nextProgress = Math.round(ratio * 100);

      setReadingProgress((current) => (current === nextProgress ? current : nextProgress));
    };

    const scheduleUpdate = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateReadingProgress();
      });
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    if (typeof ResizeObserver !== 'undefined') {
      const scopeEl = document.getElementById(readingScopeId);
      if (scopeEl) {
        resizeObserver = new ResizeObserver(scheduleUpdate);
        resizeObserver.observe(scopeEl);
      }
    }

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [readingScopeId, offsets.active, offsets.scroll]);

  const handleTocClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const heading = document.getElementById(id);
    if (!heading) {
      return;
    }

    const top = heading.getBoundingClientRect().top + window.scrollY - offsets.scroll;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    window.history.replaceState(null, '', `#${id}`);
    setActiveId(id);
  };

  const activeIndex = items.findIndex((item) => item.id === activeId);

  const resolveSegmentState = (index: number): TocSegmentState => {
    if (readingProgress >= 100 && index === items.length - 1) {
      return 'done';
    }

    if (activeIndex < 0) {
      return 'upcoming';
    }

    if (index < activeIndex) {
      return 'done';
    }

    if (index === activeIndex) {
      return 'current';
    }

    return 'upcoming';
  };

  const renderLinks = (withSheetClose = false) => (
    <ul className="m-0 list-none space-y-1.5 p-0">
      {items.map((item, index) => {
        const segmentState = resolveSegmentState(index);
        const linkNode = (
          <a
            href={`#${item.id}`}
            onClick={(event) => handleTocClick(event, item.id)}
            className={cn(
              'article-toc-link',
              item.level === 3 && 'article-toc-indent-h3',
              activeId === item.id && 'article-toc-link-active',
            )}
            aria-current={activeId === item.id ? 'location' : undefined}
          >
            <span
              aria-hidden="true"
              className={cn(
                'article-toc-segment',
                segmentState === 'done' && 'article-toc-segment-done',
                segmentState === 'current' && 'article-toc-segment-current',
                segmentState === 'upcoming' && 'article-toc-segment-upcoming',
              )}
            />
            <span>{item.text}</span>
          </a>
        );

        if (withSheetClose) {
          return (
            <li key={item.id}>
              <SheetClose asChild>{linkNode}</SheetClose>
            </li>
          );
        }

        return <li key={item.id}>{linkNode}</li>;
      })}
    </ul>
  );

  return (
    <>
      <aside className="article-toc-panel hidden lg:block">
        <div className="mb-3 text-xs font-semibold text-foreground">Table of Contents</div>
        <div
          className="article-toc-progress-track mb-3"
          role="progressbar"
          aria-label="Reading progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={readingProgress}
        >
          <div
            className="article-toc-progress-fill"
            style={{ width: `${readingProgress}%` }}
            aria-hidden="true"
          />
        </div>
        <nav aria-label="Table of contents">{renderLinks()}</nav>
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            size="sm"
            className="fixed right-[var(--fixed-ui-right)] bottom-[calc(var(--fixed-ui-bottom)+var(--draft-indicator-height)+var(--fixed-ui-stack-gap)+env(safe-area-inset-bottom))] z-40 gap-2 rounded-full px-4 shadow-lg lg:hidden"
            aria-label="Open table of contents"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            TOC
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          title="Table of contents"
          className="editorial-scope max-h-[75vh] rounded-t-2xl pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="pb-0">
            <SheetTitle>Table of Contents</SheetTitle>
            <SheetDescription className="sr-only">
              Jump to headings in this article and review reading progress.
            </SheetDescription>
            <div
              className="article-toc-progress-track"
              role="progressbar"
              aria-label="Reading progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={readingProgress}
            >
              <div
                className="article-toc-progress-fill"
                style={{ width: `${readingProgress}%` }}
                aria-hidden="true"
              />
            </div>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <nav aria-label="Table of contents">{renderLinks(true)}</nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
