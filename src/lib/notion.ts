// lib/notion.ts
import { Client } from '@notionhq/client';

export const notion = new Client({ auth: process.env.NOTION_TOKEN! });
export const projectsDatabaseId = process.env.NOTION_PROJECTS_DATABASE_ID!;

export async function getProjetosFromNotion() {
  try {
    const response = await notion.databases.query({
      database_id: projectsDatabaseId,
      page_size: 10, // só pra teste rápido
    });

    // DEBUG: imprima as chaves de properties do primeiro item
    if (response.results.length > 0) {
      const first = response.results[0] as any;
      console.log('🛠️  PROPERTIES KEYS:', Object.keys(first.properties));
      console.log('🛠️  FIRST MULTI_SELECT RAW:', first.properties['Categoria']?.multi_select);
    } else {
      console.log('🛠️  Nenhum resultado retornado pelo Notion.');
    }

    // Aí seguimos devolvendo tudo para o front, sem filtro JS ainda
    return response.results.map((page: any) => ({
      id: page.id,
      raw: page.properties,
    }));
  } catch (err) {
    console.error('❌ Erro ao buscar projetos do Notion:', err);
    return [];
  }
}
