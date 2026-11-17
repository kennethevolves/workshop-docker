import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">No encontramos ese producto</h1>
      <p className="text-muted-foreground text-sm">Puede que ya no esté disponible.</p>
      <Button variant="outline" asChild>
        <Link href="/">Ir al catálogo</Link>
      </Button>
    </div>
  );
}
