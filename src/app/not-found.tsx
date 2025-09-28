import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen pt-24 py-8 md:py-12">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          Page Not Found
        </h2>
        <p className="text-base sm:text-lg md:text-xl max-w-[600px] text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link href="/">
          <Button className="mt-4 gap-2 btn-text">
            <ArrowLeft className="h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
