// lib/notion.ts
import { Client } from '@notionhq/client';

export const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = 'a2982b0a81ff4378a8d6159012d6cfa6';

export async function getProjetosFromNotion() {
  const response = await notion.databases.query({
    database_id: databaseId,
  });

  const projetos = response.results.map((page: any) => ({
    id: page.id,
    nome: page.properties.Nome?.title?.[0]?.plain_text || "Sem nome",
    setor: page.properties.Setor?.select?.name || "Desconhecido",
    status: page.properties.Status?.select?.name || "Sem status",
    responsavel: page.properties.Responsável?.people?.[0]?.name || "Sem responsável",
    descricao: page.properties.Descrição?.rich_text?.[0]?.plain_text || "",
  }));

  return projetos;
}
