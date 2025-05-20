// pages/projetos.tsx
import { GetServerSideProps } from 'next';
import { getProjetosFromNotion } from '@/lib/notion';

type Projeto = {
  id: string;
  nome: string;
  setor: string;
  status: string;
  responsavel: string;
  descricao: string;
};

const statusColors: Record<string, string> = {
  'Planejamento': 'border-blue-500',
  'Em andamento': 'border-yellow-500',
  'Concluído': 'border-green-500',
  'Em pausa': 'border-purple-500',
  'Cancelado(a)': 'border-red-500',
  'Backlog': 'border-gray-500',
  'Sem status': 'border-gray-300',
};

export default function ProjetosPage({ projetos }: { projetos: Projeto[] }) {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold mb-8">Projetos</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projetos.map((projeto) => (
          <div
            key={projeto.id}
            className={`p-4 rounded-2xl shadow-lg bg-gray-900 border-l-4 ${statusColors[projeto.status] || 'border-white'}`}
          >
            <h2 className="text-xl font-semibold">{projeto.nome}</h2>
            <p className="text-sm text-gray-400">{projeto.setor}</p>
            <div className="mt-2 text-sm">
              <p><strong>Status:</strong> {projeto.status}</p>
              <p><strong>Responsável:</strong> {projeto.responsavel}</p>
              {projeto.descricao && (
                <p className="mt-2 text-gray-300">{projeto.descricao}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const projetos = await getProjetosFromNotion();
  return {
    props: {
      projetos,
    },
  };
};
