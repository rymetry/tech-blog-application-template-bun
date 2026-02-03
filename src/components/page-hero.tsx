import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageHeroProps {
  title: string;
  description?: string;
  className?: string;
  background?: 'diagonal' | 'qa' | 'none';
  variant?: 'center' | 'split';
  align?: 'center' | 'left';
  aside?: ReactNode;
  children?: ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function PageHero({
  title,
  description,
  className,
  background = 'diagonal',
  variant = 'center',
  align = 'center',
  aside,
  children,
  titleClassName,
  descriptionClassName,
}: PageHeroProps) {
  const backgroundClassName =
    background === 'diagonal'
      ? 'diagonal-background'
      : background === 'qa'
        ? 'qa-hero-background'
        : null;
  const alignClassName = align === 'center' ? 'text-center' : 'text-left';
  const contentWidthClassName = align === 'center' ? 'max-w-3xl mx-auto' : 'max-w-4xl';

  return (
    <section
      className={cn(
        'w-full pt-32 pb-12 md:pt-40 md:pb-16',
        backgroundClassName,
        className,
      )}
    >
      <div className="container">
        {variant === 'split' ? (
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div className="max-w-2xl mx-auto md:mx-0 space-y-4 text-center md:text-left">
              <h1
                className={cn(
                  'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight',
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
            {aside ? <div className="max-w-2xl mx-auto md:mx-0 w-full">{aside}</div> : null}
          </div>
        ) : (
          <div className={alignClassName}>
            <div className={cn('space-y-4', contentWidthClassName)}>
              <h1
                className={cn(
                  'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight',
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
        )}
      </div>
    </section>
  );
}
