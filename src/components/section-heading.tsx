import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  title,
  description,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('space-y-2', align === 'center' ? 'text-center' : 'text-left', className)}>
      <h2 className="font-bold tracking-tight">
        {title}
      </h2>
      {description ? (
        <p className="subtitle-description text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

