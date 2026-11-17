'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const MESSAGES: Record<string, { type: 'success' | 'error'; text: string }> = {
  creado: { type: 'success', text: 'Producto creado' },
  guardado: { type: 'success', text: 'Cambios guardados' },
  eliminado: { type: 'success', text: 'Producto eliminado' },
  error: { type: 'error', text: 'No se pudo completar la acción' },
  'imagen-error': {
    type: 'error',
    text: 'Los datos se guardaron, pero la imagen no. Usa JPG, PNG o WEBP de hasta 2 MB.',
  },
};

export function FlashToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const aviso = searchParams.get('aviso');

  useEffect(() => {
    if (!aviso) {
      return;
    }

    const message = MESSAGES[aviso];
    if (message) {
      toast[message.type](message.text, { id: aviso });
    }
    router.replace(pathname);
  }, [aviso, pathname, router]);

  return null;
}
