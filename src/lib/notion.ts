// lib/notion.ts
import { Client } from '@notionhq/client';
import {
  PageObjectResponse,
  PartialPageObjectResponse,
  PartialDatabaseObjectResponse,
  RichTextItemResponse,
  UserObjectResponse,
  PartialUserObjectResponse
} from '@notionhq/client/build/src/api-endpoints';

type PagePropertyValue = PageObjectResponse['properties'][string];

export const notion = new Client({ auth: process.env.NOTION_TOKEN! });

const databaseId =
  process.env.NOTION_PROJECTS_DATABASE_ID || 'a2982b0a81ff4378a8d6159012d6cfa6';

export interface Projeto {
  pageId: string;
  // displayableIssueId foi removido conforme sua solicitação anterior
  nome: string; // Virá da coluna "Descrição do Problema"
  resumo: string | null;
  status: string;
  setor: string;
  prioridade: string;
  cliente: string | null;
  criadoEm: string;
  link: string | null;
  proprietario: { nome: string } | null;
  loja: string | null;
  tipo: string | null;
}

// --- Funções Auxiliares (sem alterações aqui) ---
function getUserName(user: UserObjectResponse | PartialUserObjectResponse | undefined): string {
  if (!user) return 'Sem responsável';
  if ('name' in user && user.name) return user.name;
  if (user.id) return `Usuário ${user.id}`;
  return 'Sem responsável';
}

function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try { new URL(url); return true; } catch { return false; }
}

function getRichTextValue(prop: PagePropertyValue | undefined): string | null {
  if (prop?.type === 'rich_text' && prop.rich_text.length > 0 && prop.rich_text[0]?.plain_text) {
    return prop.rich_text[0].plain_text.trim();
  }
  return null;
}

function getSelectValue(prop: PagePropertyValue | undefined): string | null {
  if (prop?.type === 'select' && prop.select) {
    return prop.select.name;
  }
  return null;
}

function getStatusValue(prop: PagePropertyValue | undefined): string | null {
  if (prop?.type === 'status' && prop.status) {
    return prop.status.name;
  }
  return null;
}

function getNotionUniqueIdValue(prop: PagePropertyValue | undefined): string | null {
  if (prop?.type === 'unique_id' && prop.unique_id) {
    const { prefix, number } = prop.unique_id;
    if (number === null) return null;
    return prefix ? `${prefix}-${number}` : String(number);
  }
  return null;
}

function getNumberValueAsString(prop: PagePropertyValue | undefined): string | null {
  if (prop?.type === 'number' && prop.number !== null) {
    return String(prop.number);
  }
  return null;
}

function getUrlValue(prop: PagePropertyValue | undefined): string | null {
  if (prop?.type === 'url' && prop.url && isValidUrl(prop.url)) {
    return prop.url;
  }
  return null;
}

function getDateValue(prop: PagePropertyValue | undefined): string | null {
  if (prop?.type === 'date' && prop.date?.start) {
    return prop.date.start;
  }
  return null;
}

// --- Função Principal para Buscar Projetos ---
export async function getProjetosFromNotion(): Promise<Projeto[]> {
  if (!databaseId || databaseId === 'SEU_DATABASE_ID_AQUI') {
    console.error("ERRO: NOTION_PROJECTS_DATABASE_ID não está configurado.");
    return [];
  }

  try {
    console.log(`Iniciando busca de projetos no Notion, database ID: ${databaseId}`);
    const response = await notion.databases.query({ database_id: databaseId });
    const pages = response.results.filter(
      (page): page is PageObjectResponse => 'properties' in page && page.object === 'page'
    );

    if (pages.length > 0) {
      const firstPageProperties = pages[0].properties;
      console.log(
        '--- DEBUG: Propriedades da Primeira Página (Notion) ---',
        Object.keys(firstPageProperties).map((key) => ({
          key,
          type: (firstPageProperties[key] as PagePropertyValue).type,
        }))
      );
      console.log('--- FIM DEBUG ---');
    } else {
      console.warn("Nenhuma página válida encontrada na resposta do Notion.");
      return [];
    }

    const projetos: Projeto[] = pages.map((page) => {
      const properties = page.properties;

      // <<<< MODIFICADO AQUI: Buscando 'nome' da propriedade "Descrição do Problema" >>>>
      // Verifique no seu console.log qual é o TIPO da propriedade "Descrição do Problema".
      // Se for 'title':
      // const titleProp = properties['Descrição do Problema'] as Extract<PagePropertyValue, { type: 'title' }> | undefined;
      // const nome = titleProp?.title?.[0]?.plain_text?.trim() || 'Sem nome';
      // Se for 'rich_text' (mais provável para uma descrição):
      const nome = getRichTextValue(properties['Descrição do Problema']) || 
                   ( (properties['Nome do projeto'] as Extract<PagePropertyValue, { type: 'title' }>)?.title?.[0]?.plain_text?.trim() ) || // Fallback para "Nome do projeto"
                   'Sem nome';


      // <<<< IMPORTANTE: VERIFIQUE OS NOMES DAS SUAS COLUNAS "Tipo" e "Loja" NO LOG >>>>
      const tipoProperty = properties['Tipo']; // Use o nome exato do seu log
      const tipo = getSelectValue(tipoProperty) || 
                   getStatusValue(tipoProperty) || 
                   getRichTextValue(tipoProperty) || 
                   null;

      // <<<< SUBSTITUA 'LojaNomeExatoNoNotion' PELO NOME EXATO DO SEU LOG >>>>
      const lojaProperty = properties['Loja']; 
      const loja = getSelectValue(lojaProperty) || 
                   getRichTextValue(lojaProperty) || 
                   null;

      // Mapeamento das outras propriedades (verifique os nomes se necessário)
      const resumo = getRichTextValue(properties['Resumo']) || null;
      const status = getStatusValue(properties['Status']) || getSelectValue(properties['Status']) || 'Sem status';
      const setor = getSelectValue(properties['Setor']) || 'Indefinido';
      const prioridade = getSelectValue(properties['Prioridade']) || 'Sem prioridade';
      const cliente = getRichTextValue(properties['Cliente']) || null;

      let proprietario: { nome: string } | null = null;
      const proprietarioProp = properties['Proprietário'];
      if (proprietarioProp?.type === 'people' && proprietarioProp.people.length > 0) {
        proprietario = { nome: getUserName(proprietarioProp.people[0]) };
      }
      
      const link = getUrlValue(properties['Link']) || null;
      
      const criadoEmDateProp = properties['Criado em'];
      const criadoEmFormatado = getDateValue(criadoEmDateProp);
      const criadoEm = criadoEmFormatado || page.created_time;

      return {
        pageId: page.id,
        nome, 
        resumo,
        status,
        setor,
        prioridade,
        cliente,
        criadoEm,
        link,
        proprietario,
        loja,
        tipo,
      };
    });

    console.log(`Retornando ${projetos.length} projetos mapeados corretamente.`);
    return projetos;

  } catch (error) {
    const e = error as any;
    const notionErrorBody = e.body ? JSON.parse(e.body) : null;
    console.error('Erro detalhado ao buscar projetos do Notion:', notionErrorBody || e.message, e.code ? `(Código: ${e.code})` : '');
    if (notionErrorBody) console.error('Detalhes do erro Notion:', JSON.stringify(notionErrorBody, null, 2));
    return [];
  }
}