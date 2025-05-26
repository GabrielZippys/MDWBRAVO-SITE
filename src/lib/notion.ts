// lib/notion.ts

import { Client } from '@notionhq/client';
import {
  PageObjectResponse,
  PartialPageObjectResponse, // Para o tipo de resultado da query
  PartialDatabaseObjectResponse, // Para o tipo de resultado da query
  RichTextItemResponse,      // Para acessar plain_text
  UserObjectResponse,        // Para proprietário/responsável
  PartialUserObjectResponse  // Para proprietário/responsável
} from '@notionhq/client/build/src/api-endpoints';

// Tipo para um valor de propriedade individual de PageObjectResponse.properties
type PagePropertyValue = PageObjectResponse['properties'][string];

// Inicializa o cliente do Notion
export const notion = new Client({ auth: process.env.NOTION_TOKEN! });

// ID da sua base de dados de projetos no Notion
const databaseId =
  process.env.NOTION_PROJECTS_DATABASE_ID || 'SEU_DATABASE_ID_AQUI'; // << SUBSTITUA PELO SEU DATABASE ID REAL

// --- Interface Projeto Atualizada ---
export interface Projeto {
  pageId: string;
  displayableIssueId?: string;
  nome: string;
  resumo?: string;
  status: string;
  setor: string;
  prioridade: string;
  cliente?: string;
  criadoEm: string;
  link?: string;
  proprietario: { nome: string } | null;
  loja?: string;
  tipo?: string;
  // Adicione outros campos conforme necessário
  // descricao?: string;
  // imagem?: string | null;
}

// --- Funções Auxiliares Corrigidas ---

function getUserName(user: UserObjectResponse | PartialUserObjectResponse | undefined): string {
  if (!user) return 'Sem responsável';
  // UserObjectResponse tem 'name'. PartialUserObjectResponse normalmente só tem 'id'.
  if ('name' in user && user.name) {
    return user.name;
  }
  if (user.id) { // 'id' está presente em ambos
    return `Usuário ${user.id}`;
  }
  return 'Sem responsável';
}

function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function getRichTextValue(prop: PagePropertyValue | undefined): string {
  // Verifica se 'prop' existe e se é do tipo 'rich_text'
  if (prop && prop.type === 'rich_text') {
    // 'prop.rich_text' é um array de RichTextItemResponse
    if (prop.rich_text.length > 0) {
      const firstRichTextItem = prop.rich_text[0];
      // Acessa plain_text se o primeiro item existir e tiver plain_text
      return firstRichTextItem?.plain_text?.trim() || '';
    }
  }
  return '';
}

function getSelectValue(prop: PagePropertyValue | undefined): string | undefined {
  if (prop && prop.type === 'select' && prop.select) {
    return prop.select.name;
  }
  return undefined;
}

function getStatusValue(prop: PagePropertyValue | undefined): string | undefined {
  if (prop && prop.type === 'status' && prop.status) {
    return prop.status.name;
  }
  return undefined;
}

function getUniqueIdValue(prop: PagePropertyValue | undefined): string | undefined {
  if (prop && prop.type === 'unique_id' && prop.unique_id) {
    const { prefix, number } = prop.unique_id;
    if (number === null) return undefined; // ID ainda não gerado pelo Notion
    return prefix ? `${prefix}-${number}` : String(number);
  }
  return undefined;
}

function getUrlValue(prop: PagePropertyValue | undefined): string | undefined {
  if (prop && prop.type === 'url' && prop.url && isValidUrl(prop.url)) {
    return prop.url;
  }
  return undefined;
}

// --- Função Principal para Buscar Projetos ---
export async function getProjetosFromNotion(): Promise<Projeto[]> {
  if (!databaseId || databaseId === 'SEU_DATABASE_ID_AQUI') {
    console.error("ERRO: NOTION_PROJECTS_DATABASE_ID não está configurado ou está com valor placeholder.");
    return [];
  }

  try {
    console.log(`Iniciando busca de projetos no Notion, database ID: ${databaseId}`);
    const response = await notion.databases.query({ database_id: databaseId });
    console.log(`Encontrados ${response.results.length} resultados brutos do Notion.`);

    const pages = response.results.filter(
      (page): page is PageObjectResponse => 'properties' in page && page.object === 'page'
    );
    console.log(`Encontrados ${pages.length} PageObjectResponse válidos.`);

    if (pages.length > 0) {
      const firstPageProperties = pages[0].properties;
      console.log(
        'Propriedades da primeira página (VERIFIQUE OS NOMES EXATOS AQUI):',
        Object.keys(firstPageProperties).map((key) => ({
          key,
          type: (firstPageProperties[key] as PagePropertyValue).type, // Cast para o tipo correto
        }))
      );
    } else {
      console.warn("Nenhuma página válida encontrada na resposta do Notion.");
      return [];
    }

    const projetos: Projeto[] = pages.map((page) => {
      const properties = page.properties;

      const titleProp = Object.values(properties).find(
        (prop) => prop.type === 'title'
      ) as Extract<PagePropertyValue, { type: 'title' }> | undefined; // Cast para o tipo específico
      const nome = titleProp?.title?.[0]?.plain_text?.trim() || 'Sem nome';

      // IMPORTANTE: Use os nomes EXATOS das suas colunas do Notion aqui
      const displayableIssueId = getUniqueIdValue(properties['Issue Id']);
      const resumo = getRichTextValue(properties['Resumo']);
      const status = getStatusValue(properties['Status']) || getSelectValue(properties['Status']) || 'Sem status'; // Tenta status, depois select
      const setor = getSelectValue(properties['Setor']) || 'Indefinido';
      const prioridade = getSelectValue(properties['Prioridade']) || 'Sem prioridade';
      const cliente = getSelectValue(properties['Cliente']) || undefined;
      const link = getUrlValue(properties['Link']);
      const loja = getSelectValue(properties['Loja']) || getRichTextValue(properties['Loja']) || undefined;
      const tipo = getSelectValue(properties['Tipo']) || getRichTextValue(properties['Tipo']) || undefined;


      let proprietario: { nome: string } | null = null;
      const proprietarioProp = properties['Proprietário'];
      if (proprietarioProp && proprietarioProp.type === 'people' && proprietarioProp.people.length > 0) {
        // proprietarioProp.people[0] é UserObjectResponse | PartialUserObjectResponse
        proprietario = { nome: getUserName(proprietarioProp.people[0]) };
      }

      return {
        pageId: page.id,
        displayableIssueId,
        nome,
        resumo,
        status,
        setor,
        prioridade,
        cliente,
        criadoEm: page.created_time,
        link,
        proprietario,
        loja,
        tipo,
      };
    });

    console.log(`Retornando ${projetos.length} projetos mapeados corretamente.`);
    return projetos;

  } catch (error) {
    const e = error as any; // Simples cast para any para logar o erro
    const notionErrorBody = e.body ? JSON.parse(e.body) : null;
    console.error(
        'Erro detalhado ao buscar projetos do Notion:',
        notionErrorBody || e.message,
        e.code ? `(Código: ${e.code})` : ''
    );
    if (notionErrorBody) {
        console.error('Detalhes do erro Notion:', JSON.stringify(notionErrorBody, null, 2));
    }
    return [];
  }
}