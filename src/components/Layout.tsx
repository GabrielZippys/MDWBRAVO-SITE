'use client';

import Header from '@/components/Header';
import { ReactNode } from 'react';


interface LayoutProps {
  children: ReactNode;
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header /> {/* <-- Este é o único lugar onde deve aparecer */}
        {children}
      </body>
    </html>
  );
}