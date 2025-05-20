// utils/notion.ts
import { Client } from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Usa a variável do .env.local
export const projectsDatabaseId = process.env.NOTION_PROJECTS_DATABASE_ID!;

export async function getProjetosFromNotion() {
  try {
    const response = await notion.databases.query({
      database_id: projectsDatabaseId,
      filter: {
        or: [
          {
            property: 'Categoria',
            multi_select: {
              contains: 'Infra',
            },
          },
          {
            property: 'Categoria',
            multi_select: {
              contains: 'Infra & BI',
            },
          },
        ],
      },
      sorts: [
        { property: 'Created', direction: 'descending' }
      ],
    });

    return response.results.map((page: any) => {
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
