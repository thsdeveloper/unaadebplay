import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'UNAADEB Admin',
  description: 'Painel administrativo UNAADEB Play',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
