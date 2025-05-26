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

// --- Interface Projeto (conforme você definiu) ---
export interface Projeto {
  pageId: string;
  numeroChamado: string | null; // Para a coluna "Nº ID" ou "ID" do Notion
  nome: string;
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

      // Nome do projeto (prioriza "Descrição do Problema", depois "Nome do projeto")
      // <<<< CONFIRME O NOME E TIPO DE "Descrição do Problema" NO SEU LOG >>>>
      let nome = getRichTextValue(properties['Descrição do Problema']);
      if (!nome) {
        const titlePropFromNomeProjeto = properties['Nome do projeto'] as Extract<PagePropertyValue, { type: 'title' }> | undefined;
        nome = titlePropFromNomeProjeto?.title?.[0]?.plain_text?.trim() || 'Sem nome';
      }
      nome = nome || 'Sem nome';

      // --- EXTRAÇÃO DO numeroChamado (o ID de exibição) ---
      let numeroChamado: string | null = null;
      // <<<< IMPORTANTE: Substitua 'NOME_DA_SUA_COLUNA_DE_ID_NO_LOG' pelo nome EXATO da sua coluna "Nº ID" ou "ID" que aparece no LOG. >>>>
      // <<<< E verifique o TIPO dela no log para escolher a função de extração correta. >>>>
      const idProperty = properties['NOME_DA_SUA_COLUNA_DE_ID_NO_LOG']; 
      if (idProperty) {
        if (idProperty.type === 'unique_id') {
          numeroChamado = getNotionUniqueIdValue(idProperty);
        } else if (idProperty.type === 'number') {
          numeroChamado = getNumberValueAsString(idProperty);
        } else if (idProperty.type === 'rich_text' || idProperty.type === 'title') {
          numeroChamado = getRichTextValue(idProperty);
        } else {
          console.warn(`Propriedade para numeroChamado ('${ 'NOME_DA_SUA_COLUNA_DE_ID_NO_LOG' }') tem tipo inesperado: ${idProperty.type} na página ${page.id}.`);
        }
      }
      numeroChamado = numeroChamado || null; // Garante null se não encontrado
      // --- FIM DA EXTRAÇÃO DO numeroChamado ---

      // Tipo
      // <<<< IMPORTANTE: Substitua 'NOME_DA_COLUNA_TIPO_NO_LOG' pelo nome EXATO e verifique o TIPO >>>>
      const tipoProperty = properties['NOME_DA_COLUNA_TIPO_NO_LOG'];
      const tipo = getSelectValue(tipoProperty) || getStatusValue(tipoProperty) || getRichTextValue(tipoProperty) || null;

      // Loja
      // <<<< IMPORTANTE: Substitua 'NOME_DA_COLUNA_LOJA_NO_LOG' pelo nome EXATO e verifique o TIPO >>>>
      const lojaProperty = properties['NOME_DA_COLUNA_LOJA_NO_LOG']; 
      const loja = getSelectValue(lojaProperty) || getRichTextValue(lojaProperty) || null;

      // Demais propriedades (verifique os nomes se necessário, conforme seu log anterior)
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
        numeroChamado, // Adicionado
        nome,
        resumo,
        status,
        setor,
        prioridade,
        cliente,
        criadoEm,
        link,
        proprietario,
        loja,      // Adicionado
        tipo,      // Adicionado
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