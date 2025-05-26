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
  process.env.NOTION_PROJECTS_DATABASE_ID || '1733f3feb9bb808794e9eb6681ecec06'; // SEU ID DE DATABASE CORRETO

// --- Interface Projeto Atualizada ---
export interface Projeto {
  pageId: string;
  // numeroChamado FOI REMOVIDO
  nome: string;           // Virá da coluna "Descrição do Problema"
  loja: string | null;    // Virá da coluna "Loja"
  status: string;         // Virá da coluna "Status"
  tipo: string | null;    // Virá da coluna "Tipo de Ticket"
  resumo: string | null;  // CONFIRME NOME NO LOG (ex: "Resumo")
  setor: string;          // CONFIRME NOME NO LOG (ex: "Setor")
  prioridade: string;     // Virá da coluna "Prioridade"
  cliente: string | null; // CONFIRME NOME NO LOG (ex: "Cliente")
  criadoEm: string;       // Virá da coluna "Data de Criação"
  link: string | null;    // CONFIRME NOME NO LOG (ex: "Link"), se existir
  proprietario: { nome: string } | null; // Virá da coluna "Atribuído para"
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

// getNotionUniqueIdValue e getNumberValueAsString não são mais usados para numeroChamado,
// mas mantidos caso precise para outros campos.
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

      // NOME (Título principal do chamado) - Usando "Descrição do Problema"
      // Verifique o TIPO desta propriedade no log. Se for 'title', getTitleValue. Se 'rich_text', getRichTextValue.
      let nomeCalculado: string | null = null;
      const descricaoProblemaProp = properties['Descrição do Problema']; // << NOME DA IMAGEM
      const nomeDoProjetoProp = properties['Nome do projeto'] as Extract<PagePropertyValue, { type: 'title' }> | undefined; // Log anterior

      if (descricaoProblemaProp) {
          if (descricaoProblemaProp.type === 'title') {
              nomeCalculado = getTitleValue(descricaoProblemaProp);
          } else if (descricaoProblemaProp.type === 'rich_text') {
              nomeCalculado = getRichTextValue(descricaoProblemaProp);
          }
      }
      // Fallback para "Nome do projeto" se "Descrição do Problema" não for encontrada, estiver vazia, ou não for dos tipos esperados
      if (!nomeCalculado && nomeDoProjetoProp) {
          nomeCalculado = getTitleValue(nomeDoProjetoProp);
      }
      const nome: string = nomeCalculado || 'Sem Título';

      // numeroChamado FOI REMOVIDO

      // LOJA - Usando "Loja" da imagem
      // <<<< CONFIRME O TIPO DE "Loja" NO LOG (select, rich_text?) >>>>
      const lojaProperty = properties['Loja']; 
      const loja = getSelectValue(lojaProperty) || getRichTextValue(lojaProperty) || null;

      // TIPO - Usando "Tipo de Ticket" da imagem
      // <<<< CONFIRME O TIPO DE "Tipo de Ticket" NO LOG (select, status, rich_text?) >>>>
      const tipoProperty = properties['Tipo de Ticket'];
      const tipo = getSelectValue(tipoProperty) || getStatusValue(tipoProperty) || getRichTextValue(tipoProperty) || null;

      // STATUS - Usando "Status" da imagem
      // <<<< CONFIRME O TIPO DE "Status" NO LOG (deve ser 'status' ou 'select') >>>>
      const statusProp = properties['Status'];
      const status = getStatusValue(statusProp) || getSelectValue(statusProp) || 'Sem status';

      // PRIORIDADE - Usando "Prioridade" da imagem
      // <<<< CONFIRME O TIPO DE "Prioridade" NO LOG (provavelmente 'select') >>>>
      const prioridadeProp = properties['Prioridade'];
      const prioridade = getSelectValue(prioridadeProp) || 'Sem prioridade';

      // PROPRIETÁRIO - Usando "Atribuído para" da imagem
      let proprietario: { nome: string } | null = null;
      const proprietarioProp = properties['Atribuído para']; 
      if (proprietarioProp?.type === 'people' && proprietarioProp.people.length > 0) {
        proprietario = { nome: getUserName(proprietarioProp.people[0]) };
      }

      // CRIADO EM - Usando "Data de Criação" da imagem, ou fallback para created_time da página
      // <<<< CONFIRME O NOME EXATO E TIPO DE "Data de Criação" NO LOG (deve ser 'date') >>>>
      const criadoEmDateProp = properties['Data de Criação']; 
      const criadoEmFormatado = getDateValue(criadoEmDateProp);
      const criadoEm = criadoEmFormatado || page.created_time;

      // Campos que não estão na imagem, mas estavam no log anterior ou na interface.
      // Você PRECISA confirmar se eles existem na NOVA base de dados e seus NOMES EXATOS no log.
      const resumo = getRichTextValue(properties['Resumo']) || null; // Do log anterior
      const setor = getSelectValue(properties['Setor']) || 'Indefinido'; // Do log anterior
      const cliente = getRichTextValue(properties['Cliente']) || null; // Do log anterior
      const link = getUrlValue(properties['Link']) || null; // Se existir


      return {
        pageId: page.id,
        // numeroChamado foi removido
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