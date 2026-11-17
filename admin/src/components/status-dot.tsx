import { cn } from '@/lib/utils';

export function StatusDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn('size-2 rounded-full', active ? 'bg-success' : 'bg-muted-foreground/50')}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
