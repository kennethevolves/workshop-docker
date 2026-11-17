import { hostname } from 'node:os';
import { StatusDot } from '@/components/status-dot';
import type { Health } from '@/lib/types';

export function ContainerBadge({ app, health }: { app: string; health: Health | null }) {
  const databaseUp = health?.database === 'up';

  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-wrap gap-x-8 gap-y-1 px-6 py-3 font-mono text-xs">
        <span>
          {app}: {hostname()}
        </span>
        <StatusDot active={health !== null} label={`api: ${health?.container ?? 'sin respuesta'}`} />
        <StatusDot
          active={databaseUp}
          label={`db: ${!health ? 'desconocida' : databaseUp ? 'conectada' : 'caída'}`}
        />
      </div>
    </footer>
  );
}
