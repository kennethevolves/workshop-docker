'use client';

import { Trash2Icon } from 'lucide-react';
import { useTransition } from 'react';
import { deleteProduct } from '@/app/actions';
import { Button } from '@/components/ui/button';

export function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    startTransition(() => deleteProduct(id));
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={`Eliminar ${name}`}
      onClick={handleClick}
      disabled={pending}
    >
      <Trash2Icon aria-hidden="true" />
    </Button>
  );
}
