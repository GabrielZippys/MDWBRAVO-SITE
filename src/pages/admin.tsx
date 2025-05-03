import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') return <p className="p-6">Carregando...</p>;

  if (!session || session.user?.role !== 'Gestor') {
    return <p className="p-6 text-red-600">❌ Acesso negado. Somente gestores autorizados.</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-purple-700">🔐 Painel de Administração</h1>
      <p className="mb-2">Apenas gestores autorizados podem visualizar esta área.</p>

      {/* Aqui você pode exibir senhas, logins, ou até uma aba de auditoria */}
    </main>
  );
}
