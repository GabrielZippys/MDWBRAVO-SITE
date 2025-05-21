// lib/notion.ts
import { Client } from '@notionhq/client'

export const notion = new Client({ auth: process.env.NOTION_TOKEN! })
const databaseId = 'a2982b0a81ff4378a8d6159012d6cfa6'

// ① Exporta a interface Projeto
export interface Projeto {
  id: string
  nome: string
  setor: string
  status: string
  responsavel: string
  descricao: string
  imagem?: string
  link?: string
}

export async function getProjetosFromNotion(): Promise<Projeto[]> {
  const response = await notion.databases.query({ database_id: databaseId })

  return response.results.map((page: any) => ({
    id: page.id,
    nome: page.properties.Nome?.title?.[0]?.plain_text || 'Sem nome',
    setor: page.properties.Setor?.select?.name || 'Desconhecido',
    status: page.properties.Status?.select?.name || 'Sem status',
    responsavel:
      page.properties.Responsável?.people?.[0]?.name || 'Sem responsável',
    descricao:
      page.properties.Descrição?.rich_text?.[0]?.plain_text || '',
    imagem:
      page.properties['Arquivos e mídia']?.files?.[0]?.file?.url,
    link: page.properties.Link?.url,
  }))
}
