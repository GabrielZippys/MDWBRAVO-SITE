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
  process.env.NOTION_PROJECTS_DATABASE_ID || '1733f3feb9bb808794e9eb6681ecec06'; 

// --- Tipos e Interfaces ---

// Exportando ChamadoStatusValue para que possa ser usado em outros arquivos
export type ChamadoStatusValue = 'em aberto' | 'realizando' | 'designado' | 'interrompido' | 'resolvido' | 'feito' | 'outros';

export interface Projeto {
  pageId: string;
  numeroChamado: string | null;
  nome: string;
  loja: string | null;
  status: ChamadoStatusValue; // Usando o tipo mais específico
  tipo: string | null;
  resumo: string | null;         // ✅ Corrigido para string | null
  setor: string;                 // Se puder ser nulo, mude para string | null e ajuste o fallback
  prioridade: string;            // Se puder ser nulo, mude para string | null e ajuste o fallback
  cliente: string | null;        // ✅ Corrigido para string | null
  criadoEm: string;
  link: string | null;           // ✅ Corrigido para string | null
  proprietario: { nome: string } | null;
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
  return text === '' ? null : text;
}

function getTitleValue(prop: PagePropertyValue | undefined): string | null {
    if (prop?.type === 'title' && prop.title.length > 0 && prop.title[0]?.plain_text) {
        const text = prop.title[0].plain_text.trim();
        return text === '' ? null : text;
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
  if (prop?.type === 'created_time' && prop.created_time) {
    return prop.created_time;
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
  // ... (verificação do databaseId e query inicial permanecem as mesmas) ...
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

      let nomeCalculado: string | null = null;
      // <<<< 1. SUBSTITUA 'Descrição do Problema' PELO NOME EXATO NO SEU LOG >>>>
      const descricaoProblemaProp = properties['Descrição do Problema']; 
      // <<<< 2. SUBSTITUA 'Nome do projeto' PELO NOME EXATO DA SUA PROPRIEDADE 'title' OFICIAL NO LOG >>>>
      const nomeDoProjetoProp = properties['Nome do projeto'] as Extract<PagePropertyValue, { type: 'title' }> | undefined;

      if (descricaoProblemaProp) {
          if (descricaoProblemaProp.type === 'title') { nomeCalculado = getTitleValue(descricaoProblemaProp); }
          else if (descricaoProblemaProp.type === 'rich_text') { nomeCalculado = getRichTextValue(descricaoProblemaProp); }
      }
      if (!nomeCalculado && nomeDoProjetoProp) { nomeCalculado = getTitleValue(nomeDoProjetoProp); }
      const nome: string = nomeCalculado || 'Sem Título';


      let numeroChamado: string | null = null;
      // <<<< 3. SUBSTITUA 'Nº ID' PELO NOME EXATO DA SUA COLUNA DE ID NO LOG >>>>
      const idProperty = properties['Nº ID']; 
      if (idProperty) {
        if (idProperty.type === 'unique_id') { numeroChamado = getNotionUniqueIdValue(idProperty); }
        else if (idProperty.type === 'number') { numeroChamado = getNumberValueAsString(idProperty); }
        else if (idProperty.type === 'rich_text' || idProperty.type === 'title') { numeroChamado = getRichTextValue(idProperty) || getTitleValue(idProperty); }
        else { console.warn(`Propriedade 'Nº ID' tem tipo inesperado: ${idProperty.type}`); }
      }
      numeroChamado = numeroChamado || null;

      // <<<< 4. SUBSTITUA 'Tipo de Ticket' PELO NOME EXATO E VERIFIQUE O TIPO NO LOG >>>>
      const tipoProperty = properties['Tipo de Ticket'];
      const tipo = getSelectValue(tipoProperty) || getStatusValue(tipoProperty) || getRichTextValue(tipoProperty) || null;

      // <<<< 5. SUBSTITUA 'Loja' PELO NOME EXATO E VERIFIQUE O TIPO NO LOG >>>>
      const lojaProperty = properties['Loja']; 
      const loja = getSelectValue(lojaProperty) || getRichTextValue(lojaProperty) || null;

      // <<<< 6. CONFIRME OS NOMES DAS PROPRIEDADES ABAIXO COM SEU LOG >>>>
      const resumo = getRichTextValue(properties['Resumo']) || null;
      const statusRaw = getStatusValue(properties['Status']) || getSelectValue(properties['Status']);
      const status = (statusRaw || 'outros') as ChamadoStatusValue; // Cast para o tipo específico
      const setor = getSelectValue(properties['Setor']) || 'Indefinido';
      const prioridade = getSelectValue(properties['Prioridade']) || 'Sem prioridade';
      const cliente = getRichTextValue(properties['Cliente']) || null;

      let proprietario: { nome: string } | null = null;
      const proprietarioProp = properties['Atribuído para']; 
      if (proprietarioProp?.type === 'people' && proprietarioProp.people.length > 0) {
        proprietario = { nome: getUserName(proprietarioProp.people[0]) };
      }
      
      const link = getUrlValue(properties['Link']) || null;
      
      const criadoEmDateProp = properties['Data De Criação'];
      let criadoEm: string;
      if (criadoEmDateProp?.type === 'created_time') {
        criadoEm = getCreatedTimeValue(criadoEmDateProp) || page.created_time;
      } else if (criadoEmDateProp?.type === 'date') {
        criadoEm = getDateValue(criadoEmDateProp) || page.created_time;
      } else {
        criadoEm = page.created_time; 
      }
      criadoEm = criadoEm || new Date().toISOString();


      return {
        pageId: page.id,
        numeroChamado,
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