import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ContainerBadge } from '@/components/container-badge';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { apiGet } from '@/lib/api';
import type { Health } from '@/lib/types';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nexo Gamer | Admin',
};

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
          <div className="flex flex-1 flex-col">{children}</div>
          <ContainerBadge app="admin" health={health} />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
