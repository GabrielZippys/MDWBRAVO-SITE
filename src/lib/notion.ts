// lib/notion.ts
import { Client } from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// aqui pegamos a mesma var de ambiente que o seu chamados.ts usa
export const databaseId = process.env.NOTION_DATABASE_ID!;
export const projectsDatabaseId = process.env.NOTION_PROJECTS_DATABASE_ID!;

export async function getProjetosFromNotion() {
  try {
    // 1) Busca TUDO (até 100 itens) da base de projetos
    const response = await notion.databases.query({
      database_id: projectsDatabaseId,
      page_size: 100,
    });

    // 2) Filtra em JS pelas tags exatas que você usa em Notion
    const filtrados = response.results.filter((page: any) => {
      const tags = (page.properties.Categoria.multi_select || []).map((t: any) => t.name);
      return tags.includes('Infra') || tags.includes('Infra & BI');
    });

    // 3) Mapeia pro formato que o front espera
    return filtrados.map((page: any) => {
      const p = page.properties;
      return {
        id: page.id,
        titulo: p.Nome?.title?.[0]?.plain_text ?? 'Sem título',
        descricao: p.Descrição?.rich_text?.[0]?.plain_text ?? '',
        imagem: p.Imagem?.files?.[0]?.file?.url ?? '',
        link: p.Link?.url ?? '#',
      };
    });
  } catch (err) {
    console.error('Erro ao buscar projetos do Notion:', err);
    return [];
  }
}
