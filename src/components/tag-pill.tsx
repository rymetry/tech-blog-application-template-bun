import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const tagPillVariants = cva(
  'tag-text inline-flex items-center gap-1 rounded-full border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
        selected: 'bg-primary text-primary-foreground border-primary/40',
        muted: 'bg-card/50 text-muted-foreground border-border/40',
        neutral: 'bg-secondary/80 text-secondary-foreground border-border/40',
        link: 'bg-card/40 text-muted-foreground border-border/40 hover:text-primary hover:border-primary/40',
      },
      size: {
        sm: 'px-2 py-0.5',
        md: 'px-2.5 py-1',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
    },
  },
);

type TagPillProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof tagPillVariants> & {
    asChild?: boolean;
  };

export function TagPill({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: TagPillProps) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp className={cn(tagPillVariants({ variant, size, className }))} {...props} />
  );
}

export { tagPillVariants };
