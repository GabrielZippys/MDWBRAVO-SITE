import { Projeto } from '@/lib/notion'; // Assume que Projeto tem uma propriedade 'id'
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
   * @param pageId O ID da página do Notion (pode conter hifens).
   * @returns A URL completa para a página do Notion, ou null se o ID não for fornecido.
   */
  const generateNotionPageLink = (pageId: string | undefined | null): string | null => {
    if (!pageId) {
      return null;
    }
    // Remove hifens do ID para o formato de URL do Notion
    const cleanId = pageId.replace(/-/g, '');
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
            // Gera o link do Notion para cada projeto
            const notionPageUrl = generateNotionPageLink(projeto.id);

            return (
              <div key={projeto.id} className={styles.projetoCard}>
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
                  {notionPageUrl ? ( // Verifica se a URL foi gerada com sucesso
                    <a
                      href={notionPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      // O onClick para validação não é mais estritamente necessário
                      // se estamos gerando um link https válido.
                      // Você pode remover o onClick ou mantê-lo se quiser uma verificação extra.
                    >
                      Acessar Projeto
                    </a>
                  ) : (
                    // Mensagem se não foi possível gerar o link (ex: ID ausente)
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