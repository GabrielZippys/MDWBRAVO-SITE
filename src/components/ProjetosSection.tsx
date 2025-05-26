import { Projeto } from '@/lib/notion'; // Agora Projeto deve ter 'ID'
import styles from '@/styles/ProjetosSection.module.css';

interface ProjetosSectionProps {
  projetos: Projeto[];
}

export default function ProjetosSection({ projetos = [] }: ProjetosSectionProps) {
  const statusValidos = ['Planejamento', 'Em andamento', 'Em pausa'];
  const setoresValidos = ['Infra', 'Infra & BI'];

  const projetosFiltrados = projetos.filter(
    (p) => statusValidos.includes(p.status) && setoresValidos.includes(p.setor)
  );

  /**
   * Gera um link para uma página do Notion usando o ID da página.
   * @param ID O ID da página do Notion (pode conter hifens).
   * @returns A URL completa para a página do Notion, ou null se o ID não for fornecido.
   */
  const generateNotionPageLink = (ID: string | undefined | null): string | null => {
    if (!ID) {
      return null;
    }
    // Remove hifens do ID para o formato de URL do Notion
    const cleanId = ID.replace(/-/g, '');
    return `https://www.notion.so/${cleanId}`;
  };

  return (
    <section id="projetos" className={styles.projetosSection}>
      <h2 className={styles.titulo}>Projetos em Destaque 🚀</h2>

      {projetosFiltrados.length === 0 ? (
        <p className={styles.nenhumProjeto}>Nenhum projeto encontrado</p>
      ) : (
        <div className={styles.projetosGrid}>
          {projetosFiltrados.map((projeto) => {
            // MODIFICADO AQUI: Usar projeto.ID
            const notionPageUrl = generateNotionPageLink(projeto.ID);

            return (
              // MODIFICADO AQUI: Usar projeto.ID como chave
              <div key={projeto.ID} className={styles.projetoCard}>
                <h3>{projeto.nome}</h3>
                <p className={styles.resumo}>{projeto.resumo}</p>

                <ul className={styles.detalhes}>
                  <li>
                    <strong>Proprietário:</strong>{' '}
                    {Array.isArray(projeto.proprietario)
                      ? projeto.proprietario.map((p) => p.nome).join(', ')
                      : projeto.proprietario?.nome || '—'}
                  </li>
                  <li><strong>Status:</strong> {projeto.status}</li>
                  <li><strong>Setor:</strong> {projeto.setor}</li>
                  <li><strong>Prioridade:</strong> {projeto.prioridade}</li>
                  <li><strong>Cliente:</strong> {projeto.cliente || '—'}</li>
                  <li>
                    <strong>Criado em:</strong>{' '}
                    {new Date(projeto.criadoEm).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                      timeZone: 'America/Sao_Paulo',
                    })}
                  </li>
                </ul>

                <div className={styles.linkArea}>
                  {notionPageUrl ? (
                    <a
                      href={notionPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Acessar Projeto
                    </a>
                  ) : (
                    <span className={styles.semLink}>Link não pôde ser gerado</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}