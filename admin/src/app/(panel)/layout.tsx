import { ShieldCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';
import { logout } from '@/app/actions';
import { ApiDown } from '@/components/api-down';
import { FlashToast } from '@/components/flash-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { requireToken } from '@/lib/session';
import type { User } from '@/lib/types';

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const token = await requireToken();
  const me = await apiFetch<User>('/auth/me', { token });

  if (!me.ok && me.status !== 0) {
    redirect('/login');
  }

  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <ShieldCheckIcon className="text-primary size-5" aria-hidden="true" />
            Nexo Gamer · Admin
          </Link>
          <div className="flex items-center gap-1">
            {me.ok && <span className="text-muted-foreground mr-2 text-sm">{me.data.name}</span>}
            <ThemeToggle />
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {me.ok ? children : <ApiDown />}
      </main>

      <Suspense>
        <FlashToast />
      </Suspense>
    </>
  );
}
