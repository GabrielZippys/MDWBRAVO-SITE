import { Projeto } from '@/lib/notion';
import styles from './ProjetosSection.module.css'; // importa o CSS modular

interface ProjetosSectionProps {
  projetos: Projeto[];
}

export default function ProjetosSection({ projetos = [] }: ProjetosSectionProps) {
  const statusValidos = ['Planejamento', 'Em andamento', 'Em pausa'];
  const setoresValidos = ['Infra', 'Infra & BI'];

  const projetosFiltrados = projetos.filter(
    (p) => statusValidos.includes(p.status) && setoresValidos.includes(p.setor)
  );

  return (
    <section id="projetos" className={styles.projetosSection}>
      <h2 className={styles.titulo}>Projetos em Destaque 🚀</h2>

      {projetosFiltrados.length === 0 ? (
        <p className={styles.nenhumProjeto}>Nenhum projeto encontrado</p>
      ) : (
        <div className={styles.projetosGrid}>
          {projetos.map((projeto) => (
            <div key={projeto.id} className={styles.projetoCard}>
              <h3>{projeto.nome}</h3>
              <p className={styles.resumo}>{projeto.resumo}</p>

              <ul className={styles.detalhes}>
                <li><strong>Proprietário:</strong> {projeto.proprietario || '—'}</li>
                <li><strong>Status:</strong> {projeto.status}</li>
                <li><strong>Setor:</strong> {projeto.setor}</li>
                <li><strong>Prioridade:</strong> {projeto.prioridade}</li>
                <li><strong>Cliente:</strong> {projeto.cliente || '—'}</li>
                <li><strong>Criado em:</strong> {projeto.criadoEm}</li>
              </ul>

              <div className={styles.linkArea}>
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
                  >
                    Acessar Projeto
                  </a>
                ) : (
                  <span className={styles.semLink}>Sem link disponível</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
