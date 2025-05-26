// lib/notion.ts
import { Client } from '@notionhq/client';
import {
  PageObjectResponse,
  // ... outras importações ...
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
  nome: string; // Virá de "Descrição do Problema" ou "Nome do projeto"
  loja: string | null;
  status: string;
  tipo: string | null;
  // displayableIssueId foi removido
  resumo: string | null;
  setor: string;
  prioridade: string;
  cliente: string | null;
  criadoEm: string; // Deve ser uma string de data válida
  link: string | null;
  proprietario: { nome: string } | null;
}

// --- Funções Auxiliares (mantenha todas como estavam na última versão) ---
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

// getNotionUniqueIdValue e getNumberValueAsString podem ser removidos se não estiver usando para um ID de exibição
// function getNotionUniqueIdValue(prop: PagePropertyValue | undefined): string | null { /* ... */ }
// function getNumberValueAsString(prop: PagePropertyValue | undefined): string | null { /* ... */ }

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

      // NOME / TÍTULO
      // <<<< 1. VERIFIQUE SE "Descrição do Problema" EXISTE NO LOG E QUAL SEU TIPO >>>>
      // <<<<    Se for 'title', use a lógica de titleProp. Se for 'rich_text', use getRichTextValue. >>>>
      let nomePrincipal = getRichTextValue(properties['Descrição do Problema']);
      if (!nomePrincipal) {
        const fallbackTitleProp = properties['Nome do projeto'] as Extract<PagePropertyValue, { type: 'title' }> | undefined;
        nomePrincipal = fallbackTitleProp?.title?.[0]?.plain_text?.trim() || 'Título não encontrado';
      }

      // LOJA
      // <<<< 2. SUBSTITUA 'NOME_DA_COLUNA_LOJA_NO_LOG' PELO NOME EXATO DA SUA COLUNA "Loja" QUE APARECE NO LOG >>>>
      // <<<<    E verifique o TIPO dela para usar getSelectValue ou getRichTextValue >>>>
      const lojaProperty = properties['NOME_DA_COLUNA_LOJA_NO_LOG']; 
      const loja = getSelectValue(lojaProperty) || getRichTextValue(lojaProperty) || null;

      // TIPO
      // <<<< 3. SUBSTITUA 'NOME_DA_COLUNA_TIPO_NO_LOG' PELO NOME EXATO DA SUA COLUNA "Tipo" QUE APARECE NO LOG >>>>
      // <<<<    E verifique o TIPO dela >>>>
      const tipoProperty = properties['NOME_DA_COLUNA_TIPO_NO_LOG'];
      const tipo = getSelectValue(tipoProperty) || getStatusValue(tipoProperty) || getRichTextValue(tipoProperty) || null;
      
      // Outras propriedades (nomes baseados no seu log anterior)
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
      
      const criadoEmDateProp = properties['Criado em']; // Seu log mostrou { key: 'Criado em', type: 'date' }
      let criadoEm = getDateValue(criadoEmDateProp); // Tenta pegar da propriedade "Criado em"
      if (!criadoEm) { // Se não conseguir, usa o tempo de criação da página
          criadoEm = page.created_time;
      }
      // Log para depurar a data
      // console.log(`Página: ${page.id}, Propriedade 'Criado em': ${JSON.stringify(criadoEmDateProp)}, Valor Final de criadoEm: ${criadoEm}`);


      return {
        pageId: page.id,
        nome: nomePrincipal, // Usando a nova lógica para nome
        resumo,
        status,
        setor,
        prioridade,
        cliente,
        criadoEm, // Usando a nova lógica para criadoEm
        link,
        proprietario,
        loja,
        tipo,
      };
    });

    console.log(`Retornando ${projetos.length} projetos mapeados corretamente.`);
    return projetos;

  } catch (error) { // ... (seu tratamento de erro) ...
    const e = error as any;
    const notionErrorBody = e.body ? JSON.parse(e.body) : null;
    console.error('Erro detalhado ao buscar projetos do Notion:', notionErrorBody || e.message, e.code ? `(Código: ${e.code})` : '');
    if (notionErrorBody) console.error('Detalhes do erro Notion:', JSON.stringify(notionErrorBody, null, 2));
    return [];
  }
}