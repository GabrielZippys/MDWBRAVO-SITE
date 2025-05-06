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
        {/* Meta tags essenciais para responsividade */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="theme-color" content="#0a192f" />
        
        {/* SEO básico */}
        <title>MDW-BRAVO - Gestão de Chamados</title>
        <meta name="description" content="Sistema de gestão de chamados técnicos da MDW-BRAVO" />
      </Head>

      <header className="header-container">
        <div className="logo-container">
          <img src="/bravo.png" alt="Logo Bravo" className="logo" />
          <h1 className="site-title">MDW-BRAVO</h1>
        </div>

        {session && (
          <div className="user-panel">
            <div className="user-info">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Foto de perfil"
                  className="user-avatar"
                />
              )}
              <div className="user-details">
                <p className="welcome-message">
                  Bem-vindo, <span className="user-name">{session.user?.name}</span>
                  <span className="user-role">({session.user?.role || 'Sem permissão'})</span>
                </p>
                
                <div className="action-buttons">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="logout-button"
                  >
                    Sair
                  </button>

                  {session?.user?.role === 'Gestor' && (
                    <Link href="/gestao" className="admin-button">
                      ⚙️ Painel Administrativo
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}