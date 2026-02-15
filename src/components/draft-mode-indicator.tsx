'use client';

import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function DraftModeIndicator() {
  const router = useRouter();
  const currentPath = usePathname();
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDraftIndicatorHeight = () => {
      const indicatorHeight = indicatorRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty('--draft-indicator-height', `${indicatorHeight}px`);
    };

    updateDraftIndicatorHeight();

    let resizeObserver: ResizeObserver | null = null;
    if (indicatorRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateDraftIndicatorHeight);
      resizeObserver.observe(indicatorRef.current);
    }

    window.addEventListener('resize', updateDraftIndicatorHeight, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateDraftIndicatorHeight);
      document.documentElement.style.setProperty('--draft-indicator-height', '0px');
    };
  }, []);

  const handleExitDraftMode = () => {
    // Draft Modeを終了するAPIを呼び出す
    router.push(`/api/draft/disable?path=${encodeURIComponent(currentPath)}`);
  };

  return (
    <div
      ref={indicatorRef}
      className="fixed right-[var(--fixed-ui-right)] bottom-[calc(var(--fixed-ui-bottom)+env(safe-area-inset-bottom))] z-50 bg-yellow-500 text-black px-4 py-2 rounded-md shadow-lg flex items-center gap-2"
    >
      <span className="font-medium">Draft Mode</span>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleExitDraftMode}
        className="text-xs bg-white hover:bg-gray-100 text-black"
      >
        Exit
      </Button>
    </div>
  );
}
