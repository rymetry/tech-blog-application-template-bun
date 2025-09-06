'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useMemo } from 'react';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

// ページネーションの内部実装
function PaginationContent({ totalPages, currentPage }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (page === 1) {
        params.delete('page');
      } else {
        params.set('page', page.toString());
      }

      router.push(`/blog?${params.toString()}`);
    },
    [router, searchParams],
  );

  // Calculate which page numbers to show
  const pageNumbers = useMemo(() => {
    const numbers = [];

    // Always show first page
    numbers.push(1);

    // Calculate start and end of page range
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if we're at the start or end
    if (currentPage <= 2) {
      endPage = Math.min(totalPages - 1, 3);
    } else if (currentPage >= totalPages - 1) {
      startPage = Math.max(2, totalPages - 2);
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      numbers.push('ellipsis-start');
    }

    // Add page numbers in range
    for (let i = startPage; i <= endPage; i++) {
      numbers.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      numbers.push('ellipsis-end');
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      numbers.push(totalPages);
    }

    return numbers;
  }, [currentPage, totalPages]);

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
      role="navigation"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-8 w-8 bg-secondary/70 border-border/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Button>

      {pageNumbers.map((page, i) => {
        if (page === 'ellipsis-start' || page === 'ellipsis-end') {
          return (
            <span
              key={`ellipsis-${i}`}
              className="px-3 py-2 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isCurrentPage = currentPage === pageNum;

        return (
          <Button
            key={page}
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pageNum)}
            className={cn(
              'h-8 w-8 bg-secondary/70 border-border/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isCurrentPage
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary'
                : '',
            )}
            aria-label={`Page ${pageNum}`}
            aria-current={isCurrentPage ? 'page' : undefined}
          >
            {pageNum}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="h-8 w-8 bg-secondary/70 border-border/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}

// エクスポートされるメインのPaginationコンポーネント
export function Pagination(props: PaginationProps) {
  return (
    <Suspense fallback={<div>Loading pagination...</div>}>
      <PaginationContent {...props} />
    </Suspense>
  );
}
