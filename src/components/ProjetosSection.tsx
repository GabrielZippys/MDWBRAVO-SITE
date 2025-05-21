// components/ProjetosSection.tsx
import { Projeto } from '@/lib/notion';
import Image from 'next/image';
import Link from 'next/link';

interface ProjetosSectionProps {
  projetos: {
    id: string;
    nome: string;
    descricao: string;
    imagem: string | null;
    link: string | null;
  }[];
}

export default function ProjetosSection({ projetos = [] }: ProjetosSectionProps) {
  // Log para debug
  console.log('Projetos recebidos:', projetos);

  return (
    <section id="projetos" className="bg-gray-800 py-8 px-4 text-white">
      <h2 className="text-2xl font-bold text-center mb-6">Projetos em Destaque 🚀</h2>
      
      {projetos.length === 0 ? (
        <p className="text-center text-gray-300">Nenhum projeto encontrado</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {projetos.map(projeto => (
            <div
              key={projeto.id}
              className="bg-gray-700 shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Área de imagem sem link */}
              <div className="h-40 relative">
                {projeto.imagem ? (
                  // Verificar se a URL da imagem é válida
                  <div className="w-full h-full bg-gray-600">
                    <img
                      src={projeto.imagem}
                      alt={projeto.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Erro ao carregar imagem:', projeto.imagem);
                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400">
                    <span>Sem imagem</span>
                  </div>
                )}
              </div>
              
              {/* Conteúdo do projeto */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-blue-300">{projeto.nome}</h3>
                <p className="text-gray-300 mt-2">{projeto.descricao || 'Sem descrição'}</p>
                
                {/* Botões de ação */}
                <div className="mt-4">
                  {projeto.link ? (
                    <a
                      href={projeto.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        // Verificar se o link é válido
                        if (!projeto.link?.startsWith('http')) {
                          e.preventDefault();
                          console.log('Link inválido:', projeto.link);
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
            </div>
          ))}
        </div>
      )}
    </section>
  );
}