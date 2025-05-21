import { Projeto } from '@/lib/notion';
import Link from 'next/link';

interface ProjetosSectionProps {
  projetos: Projeto[]; // use o tipo completo importado de lib/notion
}

export default function ProjetosSection({ projetos = [] }: ProjetosSectionProps) {
  // Filtragem por status e setor
  const statusValidos = ['Planejamento', 'Em andamento', 'Em pausa'];
  const setoresValidos = ['Infra', 'Infra & BI'];

  const projetosFiltrados = projetos.filter(
    (p) => statusValidos.includes(p.status) && setoresValidos.includes(p.setor)
  );

  return (
    <section id="projetos" className="bg-gray-800 py-8 px-4 text-white">
      <h2 className="text-2xl font-bold text-center mb-6">Projetos em Destaque 🚀</h2>

      {projetosFiltrados.length === 0 ? (
        <p className="text-center text-gray-300">Nenhum projeto encontrado</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {projetos.map((projeto) => (
            <div
              key={projeto.id}
              className="bg-gray-700 shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow p-6"
            >
              <h3 className="text-lg font-semibold text-blue-300 mb-2">{projeto.nome}</h3>
              <p className="text-gray-300 mb-2 text-sm italic">{projeto.resumo}</p>

              <ul className="text-sm text-gray-300 mb-4 space-y-1">
                <li><strong>Proprietário:</strong> {projeto.proprietario || '—'}</li>
                <li><strong>Status:</strong> {projeto.status}</li>
                <li><strong>Setor:</strong> {projeto.setor}</li>
                <li><strong>Prioridade:</strong> {projeto.prioridade}</li>
                <li><strong>Cliente:</strong> {projeto.cliente || '—'}</li>
                <li><strong>Criado em:</strong> {projeto.criadoEm}</li>
              </ul>

              <div className="mt-4">
                {projeto.link ? (
                  <a
                    href={projeto.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!projeto.link?.startsWith('http')) {
                        e.preventDefault();
                        alert('Link inválido ou não disponível');
                      }
                    }}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Acessar Projeto
                  </a>
                ) : (
                  <span className="inline-block bg-gray-600 text-gray-300 px-4 py-2 rounded text-sm">
                    Sem link disponível
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
