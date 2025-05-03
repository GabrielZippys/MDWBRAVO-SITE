'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function GestaoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <p>Carregando...</p>;
  }

  if (!session) {
    return null; // já será redirecionado
  }

  const user = session.user;

  return (
    <main className="p-8 min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Bem-vindo à Gestão 🔐</h1>
        <p className="mb-2"><strong>Nome:</strong> {user?.name}</p>
        <p className="mb-2"><strong>Email:</strong> {user?.email}</p>
        <p className="mb-4"><strong>Papel:</strong> {user?.role || 'Sem permissão atribuída'}</p>
      </div>
    </main>
  );
}
