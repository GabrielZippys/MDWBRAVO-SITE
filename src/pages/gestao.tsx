import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Permissao {
  _id?: string;
  email: string;
  role: 'Gestor' | 'TI' | 'Loja';
}

export default function GestaoPage() {
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Gestor' | 'TI' | 'Loja'>('TI');
  const router = useRouter();

  const fetchPermissoes = async () => {
    const res = await fetch('/api/permissoes');
    const data = await res.json();
    setPermissoes(data);
  };

  useEffect(() => {
    fetchPermissoes();
  }, []);

  const salvarPermissao = async () => {
    if (!email) return;
    await fetch('/api/permissoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    setEmail('');
    setRole('TI');
    fetchPermissoes();
  };

  const removerPermissao = async (email: string) => {
    await fetch('/api/permissoes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    fetchPermissoes();
  };

  return (
    <main className="p-8 min-h-screen bg-gray-100">
      {/* Cabeçalho com botão voltar */}
      <div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-bold text-blue-700">Gestão de Acessos 🔐</h1>
</div>


      {/* Formulário de permissão */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-2">Adicionar ou Atualizar Permissão</h2>
        <input
          type="email"
          placeholder="Email"
          className="border px-3 py-2 rounded w-full mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded w-full mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value as Permissao['role'])}
        >
          <option value="TI">TI</option>
          <option value="Gestor">Gestor</option>
          <option value="Loja">Loja</option>
        </select>
        <button
          onClick={salvarPermissao}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Salvar Permissão
        </button>
      </div>

      {/* Tabela de permissões */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Usuários Autorizados</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2">Email</th>
              <th className="p-2">Papel</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {permissoes.map((p) => (
              <tr key={p.email} className="border-t">
                <td className="p-2">{p.email}</td>
                <td className="p-2">{p.role}</td>
                <td className="p-2">
                  <button
                    onClick={() => removerPermissao(p.email)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
