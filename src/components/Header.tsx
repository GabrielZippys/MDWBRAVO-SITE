// app/components/Header.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';

export default function Header() {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        {/* Conteúdo obrigatório dentro do Head */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MDW-BRAVO - Gestão de Chamados</title>
        <meta name="description" content="Sistema de gestão de chamados técnicos" />
      </Head>

      <header className="header-container">
        {/* Restante do conteúdo do header */}
        <div className="logo-container">
          <img src="/bravo.png" alt="Logo Bravo" className="logo" />
          <h1 className="site-title">MDW-BRAVO</h1>
        </div>

        {/* Botões centralizados */}
        <div className="nav-buttons">
          <Link href="/" className="home-button">
            🏠 Home
          </Link>
          
          {session?.user?.role === 'Gestor' && (
            <Link href="/gestao" className="admin-button">
              ⚙️ Painel Admin
            </Link>
          )}
        </div>

        {/* Seção do usuário */}
        {session && (
          <div className="user-panel">
            {/* ... conteúdo existente ... */}
          </div>
        )}
      </header>
    </>
  );
}