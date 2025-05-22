import { Projeto } from '@/lib/notion';
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

  // Função auxiliar para validar a URL do projeto
  const isNotionLinkValid = (url: string | undefined | null): boolean => {
    if (!url) {
      return false;
    }
    // Permite URLs HTTP, HTTPS e links diretos do aplicativo Notion
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('notion://');
  };

  return (
    <section id="projetos" className={styles.projetosSection}>
      <h2 className={styles.titulo}>Projetos em Destaque 🚀</h2>

      {projetosFiltrados.length === 0 ? (
        <p className={styles.nenhumProjeto}>Nenhum projeto encontrado</p>
      ) : (
        <div className={styles.projetosGrid}>
          {projetosFiltrados.map((projeto) => (
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
                    timeZone: 'America/Sao_Paulo', // Mantido o timezone
                  })}
                </li>
              </ul>

              <div className={styles.linkArea}>
                {projeto.link ? (
                  <a
                    href={projeto.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!isNotionLinkValid(projeto.link)) {
                        e.preventDefault(); // Impede a navegação se o link não for válido
                        alert(
                          'O link para este projeto no Notion parece ser inválido ou não está configurado corretamente.'
                        );
                      }
                      // Se for válido, o comportamento padrão do link (navegar) prossegue
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