import { cn } from '@/lib/utils';

type StatusPillTone = 'success' | 'info' | 'neutral';

interface StatusPillProps {
  label: string;
  tone?: StatusPillTone;
  className?: string;
}

const toneStyles: Record<StatusPillTone, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
  info: 'border-primary/30 bg-primary/10 text-primary',
  neutral: 'border-border/40 bg-card/40 text-muted-foreground',
};

export function StatusPill({ label, tone = 'info', className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs sm:text-sm font-medium',
        toneStyles[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
