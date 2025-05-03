import { getZona } from './classifyZone';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID as string;

export default async function fetchNotionData() {
  const allResults: any[] = [];
  let startCursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      ...(startCursor && { start_cursor: startCursor }),
      filter: {
        and: [
          { property: 'Status', status: { is_not_empty: true } },
          {
            or: [
              { property: 'Status', status: { equals: 'Designado' } },
              { property: 'Status', status: { equals: 'Realizando' } },
              { property: 'Status', status: { equals: 'Em aberto' } }
            ]
          }
        ]
      }
    });

    allResults.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor!;
  }

  return allResults.map(page => {
    const props = page.properties;
    const loja = props.Loja?.select?.name || 'Não definida';
    const status = props.Status?.status?.name || 'Não definido';
    const tipo = props['Tipo de Ticket']?.select?.name || 'Não definido';
    const dataCriacao = new Date(page.created_time);

    return {
      titulo: props['Descrição do Problema']?.title?.[0]?.plain_text || 'Sem título',
      loja,
      status,
      tipo,
      dataCriacao,
      zona: getZona(loja)
    };
  });
}
