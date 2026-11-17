import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Gamepad2Icon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ContainerBadge } from '@/components/container-badge';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { Toaster } from '@/components/ui/sonner';
import { apiGet } from '@/lib/api';
import type { Health } from '@/lib/types';
import './globals.css';

export const dynamic = 'force-dynamic';

const storeName = () => process.env.STORE_NAME ?? 'Nexo Gamer';

export function generateMetadata(): Metadata {
  return { title: storeName() };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const health = await apiGet<Health>('/health');

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <header className="border-b">
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Gamepad2Icon className="text-primary size-5" aria-hidden="true" />
                {storeName()}
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>

          <ContainerBadge app="shop" health={health} />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
