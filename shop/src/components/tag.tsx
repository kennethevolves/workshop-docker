import type { ReactNode } from 'react';

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="text-muted-foreground inline-flex shrink-0 rounded border px-1.5 py-0.5 text-xs font-normal">
      {children}
    </span>
  );
}
