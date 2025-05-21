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
  imagem: string | null
  link: string | null
}

// lib/notion.ts
function validateNotionPage(page: any): boolean {
  return (
    page.object === 'page' &&
    page.properties['BO-Câmeras no estoque, refeitório...']?.title?.length > 0
  )
}

export async function getProjetosFromNotion(): Promise<Projeto[]> {
  const response = await notion.databases.query({ database_id: databaseId })
  return response.results.map((page: any) => ({
    id: page.id,
    // Corrigido para usar a propriedade de título correta
    nome: page.properties['BO-Câmeras no estoque, refeitório...']?.title?.[0]?.plain_text ?? 'Sem nome',
    // Corrigido para usar "Setor" conforme sua base
    setor: page.properties.Setor?.select?.name ?? 'Desconhecido',
    // Corrigido para mapear o status corretamente
    status: page.properties.Status?.select?.name ?? 'Sem status',
    // Corrigido para usar "Proprietário" ao invés de "Responsável"
    responsavel: page.properties.Proprietário?.people?.[0]?.name ?? 'Sem responsável',
    // Corrigido para usar "Resumo" ao invés de "Descrição"
    descricao: page.properties.Resumo?.rich_text?.[0]?.plain_text ?? '',
    // Usando "Arquivos e mídia" para imagens
    imagem: page.properties['Arquivos e mídia']?.files?.[0]?.file?.url ?? null,
    // Adicione outras propriedades conforme necessário
    link: null // Ajuste se tiver propriedade de link
  }))
}