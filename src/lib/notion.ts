// lib/notion.ts
import { Client } from '@notionhq/client';
import { PageObjectResponse, UserObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const notion = new Client({ auth: process.env.NOTION_TOKEN! });
const databaseId = 'a2982b0a81ff4378a8d6159012d6cfa6';

// Interface Projeto existente
export interface Projeto {
  id: string;
  nome: string;
  setor: string;
  status: string;
  responsavel: string;
  descricao: string;
  imagem: string | null;
  link: string | null;
}

// Função para obter nome do usuário de forma segura
function getUserName(user: any): string {
  if (!user) return 'Sem responsável';
  
  // Verificar se é um UserObjectResponse completo que tem a propriedade name
  if ('name' in user) {
    return user.name || 'Sem responsável';
  }
  
  // Se for PartialUserObjectResponse, podemos tentar usar id ou outra propriedade disponível
  return user.id ? `Usuário ${user.id}` : 'Sem responsável';
}

// Versão corrigida da função getProjetosFromNotion
export async function getProjetosFromNotion(): Promise<Projeto[]> {
  const response = await notion.databases.query({ database_id: databaseId });
  
  // Log para debug (opcional)
  if (response.results.length > 0 && 'properties' in response.results[0]) {
    const firstPage = response.results[0] as PageObjectResponse;
    console.log("Estrutura do primeiro resultado:", Object.keys(firstPage.properties));
  }
  
  return response.results
    .filter((page): page is PageObjectResponse => 'properties' in page)
    .map((page) => {
      // Encontrar a propriedade que contém o título
      const titleProperty = Object.values(page.properties).find(
        (prop: any) => prop.type === 'title'
      );
      
      const nome = titleProperty?.type === 'title' && titleProperty.title.length > 0
        ? titleProperty.title[0].plain_text
        : 'Sem nome';
      
      // Tratamento seguro para o campo de pessoas
      let responsavel = 'Sem responsável';
      if (
        page.properties.Responsável?.type === 'people' && 
        page.properties.Responsável.people.length > 0
      ) {
        responsavel = getUserName(page.properties.Responsável.people[0]);
      }
      
      return {
        id: page.id,
        nome,
        setor: page.properties.Setor?.type === 'select' ? page.properties.Setor.select?.name ?? 'Desconhecido' : 'Desconhecido',
        status: page.properties.Status?.type === 'select' ? page.properties.Status.select?.name ?? 'Sem status' : 'Sem status',
        responsavel,
        descricao: page.properties.Descrição?.type === 'rich_text' && page.properties.Descrição.rich_text.length > 0
          ? page.properties.Descrição.rich_text[0].plain_text
          : '',
        imagem: page.properties['Arquivos e mídia']?.type === 'files' && page.properties['Arquivos e mídia'].files.length > 0
          ? page.properties['Arquivos e mídia'].files[0].type === 'file'
            ? page.properties['Arquivos e mídia'].files[0].file.url
            : null
          : null,
        link: page.properties.Link?.type === 'url' ? page.properties.Link.url : null
      };
    })
    .filter((projeto) => projeto.nome !== 'Sem nome');
}