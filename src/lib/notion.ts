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


export const notion = new Client({ auth: process.env.NOTION_DATABASE_ID! });

const databaseId =
  process.env.NOTION_PROJECTS_DATABASE_ID || '1733f3feb9bb808794e9eb6681ecec06';

export interface Projeto {
  pageId: string;
  numeroChamado: string | null; // Continuará null se a propriedade não for encontrada
  nome: string;                 // Virá de "Nome do projeto"
  loja: string | null;          // Continuará null se a propriedade não for encontrada
  status: string;
  tipo: string | null;          // Continuará null se a propriedade não for encontrada
  resumo: string | null;
  setor: string;
  prioridade: string;
  cliente: string | null;
  criadoEm: string;
  link: string | null;
  proprietario: { nome: string } | null;
}

// --- Funções Auxiliares (sem alterações) ---
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

// --- Função Principal ---
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
    } else { /* ... */ return []; }

    const projetos: Projeto[] = pages.map((page) => {
      const properties = page.properties;

      // NOME / TÍTULO: Usando "Nome do projeto" que está no seu log como tipo 'title'
      const titleProp = properties['Nome do projeto'] as Extract<PagePropertyValue, { type: 'title' }> | undefined;
      const nome = titleProp?.title?.[0]?.plain_text?.trim() || 'Sem Título';

      // NÚMERO DO CHAMADO (ID de Exibição)
      let numeroChamado: string | null = null;
      // <<<< 1. SUBSTITUA 'SUA_COLUNA_DE_ID_DO_LOG' PELO NOME EXATO DA SUA COLUNA "Nº ID" QUE APARECE NO LOG >>>>
      //    Se essa coluna não aparecer no log, numeroChamado será null.
      const idProperty = properties['SUA_COLUNA_DE_ID_DO_LOG']; 
      if (idProperty) {
        if (idProperty.type === 'unique_id') { numeroChamado = getNotionUniqueIdValue(idProperty); }
        else if (idProperty.type === 'number') { numeroChamado = getNumberValueAsString(idProperty); }
        else if (idProperty.type === 'rich_text' || idProperty.type === 'title') { numeroChamado = getRichTextValue(idProperty); }
        else { console.warn(`Propriedade para numeroChamado ('${'SUA_COLUNA_DE_ID_DO_LOG'}') tem tipo inesperado: ${idProperty.type}`); }
      }
      numeroChamado = numeroChamado || null;

      // TIPO
      // <<<< 2. SUBSTITUA 'SUA_COLUNA_TIPO_DO_LOG' PELO NOME EXATO E VERIFIQUE O TIPO >>>>
      const tipoProperty = properties['SUA_COLUNA_TIPO_DO_LOG'];
      const tipo = getSelectValue(tipoProperty) || getStatusValue(tipoProperty) || getRichTextValue(tipoProperty) || null;

      // LOJA
      // <<<< 3. SUBSTITUA 'SUA_COLUNA_LOJA_DO_LOG' PELO NOME EXATO E VERIFIQUE O TIPO >>>>
      const lojaProperty = properties['SUA_COLUNA_LOJA_DO_LOG']; 
      const loja = getSelectValue(lojaProperty) || getRichTextValue(lojaProperty) || null;

      // Demais propriedades (baseado no seu log)
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
      
      const link = getUrlValue(properties['Link']) || null; // "Link" não estava no seu último log
      
      const criadoEmDateProp = properties['Criado em'];
      const criadoEmFormatado = getDateValue(criadoEmDateProp);
      const criadoEm = criadoEmFormatado || page.created_time;
      // console.log(`Página ${page.id} - criadoEm final: ${criadoEm}, typeof: ${typeof criadoEm}`); // Log para depurar data

      return {
        pageId: page.id, numeroChamado, nome, loja, status, tipo, resumo, setor,
        prioridade, cliente, criadoEm, link, proprietario,
      };
    });
    console.log(`Retornando ${projetos.length} projetos mapeados.`);
    return projetos;
  } catch (error) { /* ... (tratamento de erro) ... */ 
    const e = error as any;
    const notionErrorBody = e.body ? JSON.parse(e.body) : null;
    console.error('Erro detalhado ao buscar projetos do Notion:', notionErrorBody || e.message, e.code ? `(Código: ${e.code})` : '');
    if (notionErrorBody) console.error('Detalhes do erro Notion:', JSON.stringify(notionErrorBody, null, 2));
    return [];
  }
}