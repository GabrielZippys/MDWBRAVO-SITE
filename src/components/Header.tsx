'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';

// Tipo customizado para a sessão
type CustomSession = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
};

export default function Header() {
  const { data: session } = useSession() as { data: CustomSession | null };

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MDW-BRAVO - Gestão de Chamados</title>
        <meta name="description" content="Sistema de gestão de chamados técnicos" />
      </Head>

      <header className="header-container">
        <div className="logo-container">
          <img src="/bravo.png" alt="Logo Bravo" className="logo" />
          <h1 className="site-title">MDW-BRAVO</h1>
        </div>

        <div className="nav-buttons">
          <Link href="/" className="home-button">
            🏠 Home
          </Link>
          
          {(session?.user?.role === 'Gestor' || session?.user?.role === 'Admin') && (
            <Link href="/gestao" className="admin-button">
              ⚙️ Painel Admin
            </Link>
          )}
        </div>

        {session?.user && (
          <div className="user-panel">
            <div className="user-info">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt="Foto de perfil"
                  className="user-avatar"
                />
              )}
              <div className="user-details">
                <p className="welcome-message">
                  Bem-vindo, <span className="user-name">{session.user.name || 'Usuário'}</span>
                  <span className="user-role">
                    ({session.user.role || 'Sem perfil'})
                  </span>
                </p>
                
                <div className="action-buttons">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="logout-button"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}