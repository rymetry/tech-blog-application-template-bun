'use client';

import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';

export default function DraftModeIndicator() {
  const router = useRouter();
  const currentPath = usePathname();

  const handleExitDraftMode = () => {
    // Draft Modeを終了するAPIを呼び出す
    router.push(`/api/draft/disable?path=${encodeURIComponent(currentPath)}`);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-yellow-500 text-black px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
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
