// src/app/layout.tsx
import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MDW Bravo',
  description: 'Sistema de Chamados',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-gray-100`}>
        <Header />
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
