// utils/notion.ts
import { Client } from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const projectsDatabaseId = process.env.NOTION_PROJECTS_DATABASE_ID!;

export async function getProjetosFromNotion() {
  try {
    // 1) Busca todos os itens da base
    const response = await notion.databases.query({
      database_id: projectsDatabaseId,
      page_size: 100,              // ajuste conforme necessidade
    });

    // 2) Filtra em JS pelos que tiverem multi_select contendo Infra ou Infra & BI
    const filtrados = response.results.filter((page: any) => {
      // substitua 'Categoria' pelo nome exato do seu campo multi-select, se for diferente
      const tags: string[] = (page.properties.Categoria.multi_select || []).map((t: any) => t.name);
      return tags.includes('Infra') || tags.includes('Infra & BI');
    });

    // 3) Mapeia para o formato que seu front espera
    return filtrados.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        titulo: props.Nome?.title?.[0]?.plain_text ?? 'Sem título',
        descricao: props.Descrição?.rich_text?.[0]?.plain_text ?? '',
        imagem: props.Imagem?.files?.[0]?.file?.url ?? '',
        link: props.Link?.url ?? '#',
      };
    });

  } catch (err) {
    console.error('Erro ao buscar projetos do Notion:', err);
    return [];
  }
}
