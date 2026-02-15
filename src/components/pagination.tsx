'use client';

import { Button } from '@/components/ui/button';
import { buildQueryString, cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

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
      const baseParams = Object.fromEntries(searchParams.entries());
      const queryString = buildQueryString({
        ...baseParams,
        page: page === 1 ? undefined : page,
      });

      router.push(`/articles${queryString}`);
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
      className="w-full overflow-x-auto"
      aria-label="Pagination"
      role="navigation"
    >
      <div className="mx-auto flex w-max items-center gap-1 px-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-11 w-11 sm:h-8 sm:w-8 bg-secondary/70 border-border/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>

        {pageNumbers.map((page, i) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <span
                key={`ellipsis-${i}`}
                className="min-w-8 px-2 py-2 text-sm text-muted-foreground text-center opacity-60"
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
              variant={isCurrentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className={cn(
                'h-11 w-11 sm:h-8 sm:w-8 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isCurrentPage ? 'border-primary' : 'bg-secondary/70 border-border/30',
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
          className="h-11 w-11 sm:h-8 sm:w-8 bg-secondary/70 border-border/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}

// エクスポートされるメインのPaginationコンポーネント
export function Pagination(props: PaginationProps) {
  return <PaginationContent {...props} />;
}
