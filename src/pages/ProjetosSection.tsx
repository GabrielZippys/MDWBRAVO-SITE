// components/ProjetosSection.tsx
import { Projeto } from '@/lib/notion'

interface ProjetosSectionProps {
  projetos: {
    id: string
    nome: string
    descricao: string
    imagem: string | null
    link: string | null
  }[]
}

export default function ProjetosSection({ projetos }: ProjetosSectionProps) {
  return (
    <section id="projetos" className="bg-gray-100 py-8 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">Projetos em Destaque 🚀</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projetos.map(p => (
          <a
            key={p.id}
            href={p.link ?? '#'}
            target={p.link ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {p.imagem && (
              <img 
                src={p.imagem} 
                alt={p.nome} 
                className="w-full h-40 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.jpg'
                }}
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{p.nome}</h3>
              <p className="text-gray-600 text-sm">{p.descricao || '—'}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}