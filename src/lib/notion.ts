// utils/notion.ts
import { Client } from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const databaseId = process.env.NOTION_DATABASE_ID;

export async function getProjetosFromNotion() {
  const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_PROJECTS_DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    }
  });

  const data = await response.json();
  return data.results.map((page: { id: any; properties: { Nome: { title: { text: { content: any; }; }[]; }; Descrição: { rich_text: { text: { content: any; }; }[]; }; Imagem: { files: { file: { url: any; }; }[]; }; Link: { url: any; }; }; }) => {
    return {
      id: page.id,
      titulo: page.properties?.Nome?.title?.[0]?.text?.content || 'Sem título',
      descricao: page.properties?.Descrição?.rich_text?.[0]?.text?.content || '',
      imagem: page.properties?.Imagem?.files?.[0]?.file?.url || '',
      link: page.properties?.Link?.url || '#'
    };
  });
}
