import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeading({
  title,
  description,
  align = 'center',
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn('space-y-2', align === 'center' ? 'text-center' : 'text-left', className)}>
      <h2 className={cn('font-bold tracking-tight', titleClassName)}>
        {title}
      </h2>
      {description ? (
        <p className={cn('subtitle-description text-muted-foreground', descriptionClassName)}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
