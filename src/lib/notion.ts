// lib/notion.ts
import { Client } from '@notionhq/client';
import { PageObjectResponse, UserObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const notion = new Client({ auth: process.env.NOTION_TOKEN! });
const databaseId = process.env.NOTION_DATABASE_ID || 'a2982b0a81ff4378a8d6159012d6cfa6';

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
  filter: {
    or: [
      {
        property: "Status",
        status: {
          equals: "Em aberto"
        }
      },
      {
        property: "Status",
        status: {
          equals: "Designado"
        }
      },
      {
        property: "Status",
        status: {
          equals: "Interrompido"
        }
      },
      {
        property: "Status",
        status: {
          equals: "Realizando"
        }
      }
    ]
  },

      sorts: [
        {
          property: "Data",
          direction: "descending"
        }
      ]
    });
    
    console.log(`Encontrados ${response.results.length} resultados no Notion`);
    
    // Obter apenas páginas completas (com properties)
    const pages = response.results.filter((page): page is PageObjectResponse => 'properties' in page);
    
    // Debug: examinar a primeira página para entender sua estrutura
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
      // Encontrar a propriedade de título (qualquer propriedade do tipo 'title')
      const titleProp = Object.values(page.properties).find(
        (prop: any) => prop.type === 'title'
      ) as any;
      
      // Obter o nome do projeto
      let nome = 'Sem nome';
      if (titleProp?.type === 'title' && titleProp.title.length > 0) {
        nome = titleProp.title[0].plain_text.trim();
      }
      
      // Obter descrição segura
      let descricao = '';
      const descProp = page.properties.Descrição || Object.values(page.properties).find(
        (prop: any) => prop.type === 'rich_text'
      ) as any;
      
      if (descProp?.type === 'rich_text' && descProp.rich_text.length > 0) {
        descricao = descProp.rich_text[0].plain_text;
      }
      
      // Obter imagem segura
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
      
      // Obter link seguro
      let link: string | null = null;
      const linkProp = page.properties.Link || Object.values(page.properties).find(
        (prop: any) => prop.type === 'url'
      ) as any;
      
      if (linkProp?.type === 'url' && linkProp.url) {
        link = isValidUrl(linkProp.url) ? linkProp.url : null;
      }
      
      // Obter responsável
      let responsavel = 'Sem responsável';
      const respProp = page.properties.Responsável || Object.values(page.properties).find(
        (prop: any) => prop.type === 'people'
      ) as any;
      
      if (respProp?.type === 'people' && respProp.people.length > 0) {
        responsavel = getUserName(respProp.people[0]);
      }
      
      // Obter setor
      let setor = 'Desconhecido';
      const setorProp = page.properties.Setor || Object.values(page.properties).find(
        (prop: any) => prop.type === 'select'
      ) as any;
      
      if (setorProp?.type === 'select' && setorProp.select) {
        setor = setorProp.select.name || 'Desconhecido';
      }
      
      // Obter status
      let status = 'Desconhecido';
      const statusProp = page.properties.Status;
      if (statusProp?.type === 'status' && statusProp.status) {
        status = statusProp.status.name || 'Desconhecido';
      } else if (statusProp?.type === 'select' && statusProp.select) {
        status = statusProp.select.name || 'Desconhecido';
      }
      
      return {
        id: page.id,
        nome,
        setor,
        status,
        responsavel,
        descricao,
        imagem,
        link
      };
    })
    .filter(projeto => 
      // Remover projetos sem nome ou com nomes genéricos
      projeto.nome !== 'Sem nome' && 
      projeto.nome.trim() !== '' &&
      !projeto.nome.includes('Acesso Restrito')
    );
    
    console.log(`Retornando ${projetos.length} projetos processados`);
    return projetos;
    
  } catch (error) {
    console.error('Erro ao buscar dados do Notion:', error);
    return []; // Retornar array vazio em caso de erro
  }
}