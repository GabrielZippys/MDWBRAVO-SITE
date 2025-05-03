// app/components/Header.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow w-full">
        <img src="/bravo.png" alt="Logo Bravo" className="bravo" />
        <p className="MDW_TITU">MDW-BRAVO</p>
    

      {session && (
        <div className="foto">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt="Foto de perfil"
              className="w-10 h-10 rounded-full border-2 border-gray-300"
            />
          )}
          <div className="direita">
            <p className="text-sm text-gray-600">
              Bem-vindo, {session.user?.name} ({session.user?.role || 'Sem permissão'})
            <button
              onClick={() => signOut()}
              className="butodesair"
            >
              Sair
            </button>
            </p>

            {session?.user?.role === 'Gestor' && (
          <Link href="/gestao">
            <button className="ada">
              ⚙️ Acessar Administração
            </button>
          </Link>
        )}
          </div>
        </div>
      )}
    </header>
  );
}
