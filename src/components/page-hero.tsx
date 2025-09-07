import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageHeroProps {
  title: string;
  description?: string;
  className?: string;
  background?: 'diagonal' | 'none';
  children?: ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function PageHero({
  title,
  description,
  className,
  background = 'diagonal',
  children,
  titleClassName,
  descriptionClassName,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'w-full pt-32 pb-12 md:pt-40 md:pb-16',
        background === 'diagonal' && 'diagonal-background',
        className,
      )}
    >
      <div className="container text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1
            className={cn(
              'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter',
              titleClassName,
            )}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={cn(
                'text-base sm:text-[17px] md:text-lg lg:text-xl text-muted-foreground',
                descriptionClassName,
              )}
            >
              {description}
            </p>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
