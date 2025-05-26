// lib/notion.ts

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

// O restante do seu código...

type PagePropertyValue = PageObjectResponse['properties'][string];

export const notion = new Client({ auth: process.env.NOTION_TOKEN! });

const databaseId =
  process.env.NOTION_PROJECTS_DATABASE_ID || 'a2982b0a81ff4378a8d6159012d6cfa6'; // Confirmado que este ID está sendo usado

// --- Interface Projeto Atualizada para usar 'null' para valores opcionais ---
export interface Projeto {
  pageId: string;
  displayableIssueId: string | null; // Alterado de undefined para null
  nome: string;
  resumo: string | null;             // Alterado
  status: string;
  setor: string;
  prioridade: string;
  cliente: string | null;            // Alterado (era rich_text)
  criadoEm: string;                  // page.created_time é sempre uma string
  link: string | null;               // Alterado
  proprietario: { nome: string } | null;
  loja: string | null;               // Alterado
  tipo: string | null;               // Alterado
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
  try {
    new URL(url);
    return true;
  } catch { return false; }
}

function getRichTextValue(prop: PagePropertyValue | undefined): string | null {
  if (prop?.type === 'rich_text' && prop.rich_text.length > 0 && prop.rich_text[0]?.plain_text) {
    return prop.rich_text[0].plain_text.trim();
  }
  return null; // Retorna null se vazio ou tipo incorreto
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

function getUniqueIdValue(prop: PagePropertyValue | undefined): string | null {
  if (prop?.type === 'unique_id' && prop.unique_id) {
    const { prefix, number } = prop.unique_id;
    if (number === null) return null;
    return prefix ? `${prefix}-${number}` : String(number);
  }
  return null; // Retorna null se não for unique_id ou não tiver valor
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
  if (!databaseId || databaseId === 'SEU_DATABASE_ID_AQUI') { // Verifique se o ID não é o placeholder
    console.error("ERRO: NOTION_PROJECTS_DATABASE_ID não está configurado.");
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
        'Propriedades da primeira página (CONFIRA AQUI OS NOMES EXATOS):',
        Object.keys(firstPageProperties).map((key) => ({
          key,
          type: (firstPageProperties[key] as PagePropertyValue).type,
        }))
      );
    } else {
      console.warn("Nenhuma página válida encontrada na resposta do Notion.");
      return [];
    }

    const projetos: Projeto[] = pages.map((page) => {
      const properties = page.properties;

      // Use 'Nome do projeto' conforme seu log
      const titleProp = properties['Nome do projeto'] as Extract<PagePropertyValue, { type: 'title' }> | undefined;
      const nome = titleProp?.title?.[0]?.plain_text?.trim() || 'Sem nome';

      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      // IMPORTANTE: Verifique se você TEM uma coluna "Issue Id" no Notion.
      // Se tiver, use o nome exato dela aqui. Se não tiver, displayableIssueId será null.
      const displayableIssueId = getUniqueIdValue(properties['Issue Id']) || null;
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

      // Mapeando conforme seu log
      const resumo = getRichTextValue(properties['Resumo']) || null;
      const status = getStatusValue(properties['Status']) || getSelectValue(properties['Status']) || 'Sem status';
      const setor = getSelectValue(properties['Setor']) || 'Indefinido';
      const prioridade = getSelectValue(properties['Prioridade']) || 'Sem prioridade';
      const cliente = getRichTextValue(properties['Cliente']) || null; // Cliente é rich_text no seu log

      let proprietario: { nome: string } | null = null;
      const proprietarioProp = properties['Proprietário'];
      if (proprietarioProp?.type === 'people' && proprietarioProp.people.length > 0) {
        proprietario = { nome: getUserName(proprietarioProp.people[0]) };
      }

      // Link - Se você tiver uma propriedade 'Link' do tipo URL
      const link = getUrlValue(properties['Link']) || null;

      // Loja e Tipo - Se estas colunas existirem no seu Notion
      // Verifique os nomes exatos no log e substitua 'LojaNomeExatoNoNotion' e 'TipoNomeExatoNoNotion'
      const loja = getSelectValue(properties['LojaNomeExatoNoNotion']) || getRichTextValue(properties['LojaNomeExatoNoNotion']) || null;
      const tipo = getSelectValue(properties['TipoNomeExatoNoNotion']) || getRichTextValue(properties['TipoNomeExatoNoNotion']) || null;

      // Criado Em: Pode usar page.created_time ou a propriedade 'Criado em' do tipo date
      // page.created_time é mais simples se for o tempo de criação da página
      const criadoEm = page.created_time;
      // Se quiser usar a propriedade 'Criado em' do tipo 'date':
      // const criadoEmDateProp = getDateValue(properties['Criado em']);
      // const criadoEm = criadoEmDateProp || page.created_time;


      return {
        pageId: page.id,
        displayableIssueId,
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