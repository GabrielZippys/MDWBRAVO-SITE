// lib/notion.ts
import { Client } from '@notionhq/client';
import { PageObjectResponse, UserObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const notion = new Client({ auth: process.env.NOTION_TOKEN! });
const databaseId = process.env.NOTION_PROJECTS_DATABASE_ID || 'a2982b0a81ff4378a8d6159012d6cfa6';

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
  
  return user.id ? `Usuário ${user.id}` : 'Sem responsável';
}

// Função para validar URLs
function isValidUrl(url: string | null): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Versão corrigida da função getProjetosFromNotion
export async function getProjetosFromNotion(): Promise<Projeto[]> {
  try {
    console.log('Iniciando busca de projetos no Notion, database ID:', databaseId);
    
    const response = await notion.databases.query({
      database_id: databaseId,
      // Sem filtro neste momento
    });

    console.log(`Encontrados ${response.results.length} resultados no Notion`);
    
    const pages = response.results.filter((page): page is PageObjectResponse => 'properties' in page);

    if (pages.length > 0) {
      const firstPage = pages[0];
      console.log('Exemplo de propriedades disponíveis:', 
        Object.keys(firstPage.properties).map(key => ({
          key,
          type: (firstPage.properties[key] as any).type
        }))
      );
    }

    const projetos = pages.map((page) => {
      const titleProp = Object.values(page.properties).find(
        (prop: any) => prop.type === 'title'
      ) as any;

      let nome = 'Sem nome';
      if (titleProp?.type === 'title' && titleProp.title.length > 0) {
        nome = titleProp.title[0].plain_text.trim();
      }

      let descricao = '';
      const descProp = page.properties.Descrição || Object.values(page.properties).find(
        (prop: any) => prop.type === 'rich_text'
      ) as any;

      if (descProp?.type === 'rich_text' && descProp.rich_text.length > 0) {
        descricao = descProp.rich_text[0].plain_text;
      }

      let imagem: string | null = null;
      const imageProp = page.properties['Arquivos e mídia'] || 
                        page.properties.Imagem ||
                        Object.values(page.properties).find(
                          (prop: any) => prop.type === 'files'
                        ) as any;

      if (imageProp?.type === 'files' && imageProp.files.length > 0) {
        const file = imageProp.files[0];
        if (file.type === 'file' && file.file?.url) {
          imagem = file.file.url;
        } else if (file.type === 'external' && file.external?.url) {
          imagem = file.external.url;
        }
      }

      let link: string | null = null;
      const linkProp = page.properties.Link || Object.values(page.properties).find(
        (prop: any) => prop.type === 'url'
      ) as any;

      if (linkProp?.type === 'url' && isValidUrl(linkProp.url)) {
        link = linkProp.url;
      }

      const setorProp = page.properties.Setor as any;
      const statusProp = page.properties.Status as any;
      const responsavelProp = page.properties.Responsável as any;

      return {
        id: page.id,
        nome,
        setor: setorProp?.select?.name || 'Indefinido',
        status: statusProp?.status?.name || 'Sem status',
        responsavel: getUserName(responsavelProp?.people?.[0]),
        descricao,
        imagem,
        link
      };
    });

    console.log(`Retornando ${projetos.length} projetos processados`);
    return projetos;

  } catch (error) {
    console.error('Erro ao buscar projetos do Notion:', error);
    return [];
  }
}
