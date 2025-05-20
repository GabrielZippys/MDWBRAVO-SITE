'use client';

import Header from '@/components/Header';
import { ReactNode } from 'react';
import '@/globals.css'

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
