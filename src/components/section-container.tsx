import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
}

export function SectionContainer({ children, className }: SectionContainerProps) {
  return <section className={cn('container', className)}>{children}</section>;
}
