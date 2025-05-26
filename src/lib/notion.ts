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

// Tipo para um valor de propriedade individual de PageObjectResponse.properties
type PagePropertyValue = PageObjectResponse['properties'][string];

// Inicializa o cliente do Notion
export const notion = new Client({ auth: process.env.NOTION_TOKEN! });

// ID da sua base de dados de projetos no Notion
const databaseId =
  process.env.NOTION_PROJECTS_DATABASE_ID || '1733f3feb9bb808794e9eb6681ecec06'; 

// --- Interface Projeto ATUALIZADA ---
export interface Projeto {
  pageId: string;
  numeroChamado: string | null;     // Da coluna "Nº ID"
  nome: string;                     // Da coluna "Descrição do Problema"
  loja: string | null;              // Da coluna "Loja"
  status: string;                   // Da coluna "Status"
  tipo: string | null;              // Da coluna "Tipo de Ticket"
  resumo: string | null;            // CONFIRME NOME E TIPO NO LOG (ex: "Resumo")
  setor: string;                    // CONFIRME NOME E TIPO NO LOG (ex: "Setor")
  prioridade: string;               // Da coluna "Prioridade"
  cliente: string | null;           // CONFIRME NOME E TIPO NO LOG (ex: "Cliente")
  criadoEm: string;                 // Da coluna "Data de Criação"
  link: string | null;              // CONFIRME NOME E TIPO NO LOG (ex: "Link"), se existir
  proprietario: { nome: string } | null; // Da coluna "Atribuído para"
}

// --- Funções Auxiliares ---
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
  const text = prop?.type === 'rich_text' && prop.rich_text.length > 0 && prop.rich_text[0]?.plain_text
    ? prop.rich_text[0].plain_text.trim()
    : null;
  return text === '' ? null : text; // String vazia também vira null
}

function getTitleValue(prop: PagePropertyValue | undefined): string | null {
    if (prop?.type === 'title' && prop.title.length > 0 && prop.title[0]?.plain_text) {
        const text = prop.title[0].plain_text.trim();
        return text === '' ? null : text; // String vazia também vira null
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

function getCreatedTimeValue(prop: PagePropertyValue | undefined): string | null {
  // Para propriedades do tipo "Created time"
  if (prop?.type === 'created_time' && prop.created_time) {
    return prop.created_time;
  }
  return null;
}

function getDateValue(prop: PagePropertyValue | undefined): string | null {
  // Para propriedades do tipo "Date"
  if (prop?.type === 'date' && prop.date?.start) {
    return prop.date.start;
  }
  return null;
}

// --- Função Principal para Buscar Projetos ---
export async function getProjetosFromNotion(): Promise<Projeto[]> {
  if (!databaseId || databaseId === 'SEU_DATABASE_ID_AQUI_PLACEHOLDER_ANTIGO' || (databaseId === 'a2982b0a81ff4378a8d6159012d6cfa6' && process.env.NOTION_PROJECTS_DATABASE_ID !== databaseId) ) {
    console.error("ERRO: ID da base de dados do Notion não configurado corretamente. Verifique a variável de ambiente NOTION_PROJECTS_DATABASE_ID e o fallback no código.");
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
      console.warn(`Nenhuma página válida encontrada na base de dados do Notion: ${databaseId}`);
      return [];
    }

    const projetos: Projeto[] = pages.map((page) => {
      const properties = page.properties;

      // NOME (Título principal do chamado)
      // Conforme sua info: coluna "Descrição do Problema" é tipo 'title'
      // <<<< CONFIRME O NOME "Descrição do Problema" E O TIPO 'title' NO SEU LOG >>>>
      const nomeProp = properties['Descrição do Problema'];
      const nome: string = getTitleValue(nomeProp) || 'Sem Título';

      // NÚMERO DO CHAMADO (ID de Exibição)
      let numeroChamado: string | null = null;
      // <<<< USE O NOME EXATO DA SUA COLUNA "Nº ID" QUE APARECE NO LOG >>>>
      const idNumProperty = properties['Nº ID']; 
      if (idNumProperty) {
        if (idNumProperty.type === 'unique_id') { numeroChamado = getNotionUniqueIdValue(idNumProperty); }
        else if (idNumProperty.type === 'number') { numeroChamado = getNumberValueAsString(idNumProperty); }
        else if (idNumProperty.type === 'rich_text' || idNumProperty.type === 'title') { numeroChamado = getRichTextValue(idNumProperty) || getTitleValue(idNumProperty); }
        else { console.warn(`Propriedade "Nº ID" tem tipo inesperado: ${idNumProperty.type} na página ${page.id}.`); }
      }
      numeroChamado = numeroChamado || null;

      // LOJA
      // <<<< USE O NOME EXATO "Loja" E VERIFIQUE O TIPO NO LOG (select, rich_text?) >>>>
      const lojaProperty = properties['Loja']; 
      const loja = getSelectValue(lojaProperty) || getRichTextValue(lojaProperty) || null;

      // TIPO
      // <<<< USE O NOME EXATO "Tipo de Ticket" E VERIFIQUE O TIPO NO LOG (select, status, rich_text?) >>>>
      const tipoProperty = properties['Tipo de Ticket'];
      const tipo = getSelectValue(tipoProperty) || getStatusValue(tipoProperty) || getRichTextValue(tipoProperty) || null;
      
      // STATUS
      // <<<< USE O NOME EXATO "Status" E VERIFIQUE O TIPO NO LOG (status, select?) >>>>
      const statusProperty = properties['Status'];
      const status = getStatusValue(statusProperty) || getSelectValue(statusProperty) || 'Sem status';

      // PRIORIDADE
      // <<<< USE O NOME EXATO "Prioridade" E VERIFIQUE O TIPO NO LOG (provavelmente 'select') >>>>
      const prioridadeProperty = properties['Prioridade'];
      const prioridade = getSelectValue(prioridadeProperty) || 'Sem prioridade';

      // PROPRIETÁRIO
      // <<<< USE O NOME EXATO "Atribuído para" E VERIFIQUE O TIPO (deve ser 'people') >>>>
      let proprietario: { nome: string } | null = null;
      const proprietarioProp = properties['Atribuído para']; 
      if (proprietarioProp?.type === 'people' && proprietarioProp.people.length > 0) {
        proprietario = { nome: getUserName(proprietarioProp.people[0]) };
      }
      
      // CRIADO EM
      // Conforme sua info: coluna "Data De Criação" é tipo "Criado em" (API type 'created_time')
      // <<<< USE O NOME EXATO "Data De Criação" E VERIFIQUE O TIPO NO LOG (created_time ou date?) >>>>
      let criadoEm: string;
      const criadoEmProp = properties['Data De Criação'];
      if (criadoEmProp?.type === 'created_time') {
        criadoEm = getCreatedTimeValue(criadoEmProp) || page.created_time; // getCreatedTimeValue retorna string | null
      } else if (criadoEmProp?.type === 'date') {
        criadoEm = getDateValue(criadoEmProp) || page.created_time;
      } else {
        criadoEm = page.created_time; // Fallback final
      }
      criadoEm = criadoEm || new Date().toISOString(); // Garante que nunca seja null/undefined para o tipo string

      // Campos opcionais ou que precisam de confirmação do nome no log
      const resumo = getRichTextValue(properties['Resumo']) || null;         // << CONFIRME "Resumo"
      const setor = getSelectValue(properties['Setor']) || 'Indefinido';     // << CONFIRME "Setor"
      const cliente = getRichTextValue(properties['Cliente']) || null;     // << CONFIRME "Cliente"
      const link = getUrlValue(properties['Link']) || null;                 // << CONFIRME "Link"

      return {
        pageId: page.id,
        numeroChamado, // Incluído para o Dashboard
        nome,
        loja,
        status,
        tipo,
        resumo,
        setor,
        prioridade,
        cliente,
        criadoEm,
        link,
        proprietario,
      };
    });

    console.log(`Retornando ${projetos.length} projetos mapeados (da base de dados ${databaseId}).`);
    return projetos;

  } catch (error) {
    const e = error as any;
    const notionErrorBody = e.body ? JSON.parse(e.body) : null;
    console.error('Erro detalhado ao buscar projetos do Notion:', notionErrorBody || e.message, e.code ? `(Código: ${e.code})` : '');
    if (notionErrorBody) console.error('Detalhes do erro Notion:', JSON.stringify(notionErrorBody, null, 2));
    return [];
  }
}