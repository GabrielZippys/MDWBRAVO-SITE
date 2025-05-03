import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import logo from '@/public/bravo.png'; // Certifique-se de colocar o arquivo em `src/assets/bravo.png`

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-800 to-purple-700 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
          <Image src="/bravo.png" alt="Logo Bravo" width={40} height={40} />
            <h1 className="text-white text-lg sm:text-xl font-bold tracking-wide animate-fade-in">
              Painel de Chamados
            </h1>
          </div>

          {session && (
            <div className="flex items-center gap-4 text-sm text-white">
              <p className="hidden sm:inline">
                {session.user?.name} ({(session.user as any)?.role || 'Visitante'})
              </p>

              {session.user?.role === 'Gestor' && (
                <Link
                  href="/gestao"
                  className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition"
                >
                  ⚙️ Administração
                </Link>
              )}

              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="pt-20 px-4 sm:px-8">{children}</main>
    </div>
  );
}
