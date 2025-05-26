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
  process.env.NOTION_PROJECTS_DATABASE_ID || 'a2982b0a81ff4378a8d6159012d6cfa6'; // Confirme se este é o ID correto

// --- Interface Projeto Atualizada ---
export interface Projeto {
  ID: string;                   // UUID da página do Notion (para gerar o link direto)
  displayableID: string | null; // Virá da coluna "ID" do Notion (ex: "456")
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
  tipo: string | null;               // Virá da coluna "Tipo" do Notion
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

// Para o tipo "ID" nativo do Notion (unique_id na API)
function getNotionUniqueIdValue(prop: PagePropertyValue | undefined): string | null {
  if (prop?.type === 'unique_id' && prop.unique_id) {
    const { prefix, number } = prop.unique_id;
    if (number === null) return null;
    return prefix ? `${prefix}-${number}` : String(number);
  }
  return null;
}

// Para propriedades do tipo "Number" no Notion, retorna como string
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
    console.error("ERRO: NOTION_PROJECTS_DATABASE_ID não está configurado ou está com valor placeholder.");
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

      // Nome do projeto (conforme seu log anterior: "Nome do projeto")
      const titleProp = properties['Nome do projeto'] as Extract<PagePropertyValue, { type: 'title' }> | undefined;
      const nome = titleProp?.title?.[0]?.plain_text?.trim() || 'Sem nome';

      // --- EXTRAÇÃO DO displayableID ---
      // Baseado na sua informação de que a coluna se chama "ID" e contém números.
      // Verifique o 'type' da sua propriedade "ID" no console.log.
      let displayableID: string | null = null;
      // <<<< IMPORTANTE: Use o nome EXATO da sua coluna "ID" aqui >>>>
      const idProperty = properties['ID']; 

      if (idProperty) {
        if (idProperty.type === 'unique_id') { // Se for o tipo "ID" nativo do Notion
          displayableID = getNotionUniqueIdValue(idProperty);
        } else if (idProperty.type === 'number') { // Se for uma coluna do tipo "Número"
          displayableID = getNumberValueAsString(idProperty);
        } else if (idProperty.type === 'rich_text' || idProperty.type === 'title') { // Se for uma coluna de Texto ou Título
          displayableID = getRichTextValue(idProperty);
        } else {
          // Se for outro tipo, você pode logar um aviso ou tentar outra extração.
          // O console.log acima ajudará a identificar o tipo correto.
          console.warn(`Propriedade 'ID' (ou o nome que você usar) tem tipo inesperado: ${idProperty.type} para a página ${page.id}. Verifique o mapeamento.`);
        }
      }
      displayableID = displayableID || null;
      // --- FIM DA EXTRAÇÃO DO displayableID ---

      // Tipo (conforme sua imagem: "Tipo")
      // <<<< IMPORTANTE: Verifique o nome e o TIPO desta propriedade no log (select, status, rich_text?) >>>>
      const tipoProperty = properties['Tipo'];
      const tipo = getSelectValue(tipoProperty) || 
                   getStatusValue(tipoProperty) || 
                   getRichTextValue(tipoProperty) || 
                   null;

      // Loja (VOCÊ PRECISA VERIFICAR O NOME EXATO DESTA COLUNA NO SEU NOTION E NO LOG)
      // <<<< SUBSTITUA 'LojaNomeExatoNoNotion' PELO NOME CORRETO >>>>
      const lojaProperty = properties['LojaNomeExatoNoNotion']; 
      const loja = getSelectValue(lojaProperty) || 
                   getRichTextValue(lojaProperty) || 
                   null;

      // Demais propriedades (conforme seu log anterior ou nomes corretos)
      const resumo = getRichTextValue(properties['Resumo']) || null;
      const status = getStatusValue(properties['Status']) || getSelectValue(properties['Status']) || 'Sem status';
      const setor = getSelectValue(properties['Setor']) || 'Indefinido';
      const prioridade = getSelectValue(properties['Prioridade']) || 'Sem prioridade';
      const cliente = getRichTextValue(properties['Cliente']) || null; // Cliente era rich_text no seu log

      let proprietario: { nome: string } | null = null;
      const proprietarioProp = properties['Proprietário'];
      if (proprietarioProp?.type === 'people' && proprietarioProp.people.length > 0) {
        proprietario = { nome: getUserName(proprietarioProp.people[0]) };
      }
      
      const link = getUrlValue(properties['Link']) || null; // Se tiver uma coluna "Link"
      
      // Criado Em: Usando page.created_time ou a propriedade "Criado em" (tipo date) do seu log
      const criadoEmDateProp = properties['Criado em'];
      const criadoEmFormatado = getDateValue(criadoEmDateProp);
      const criadoEm = criadoEmFormatado || page.created_time;


      return {
        ID: page.id,
        displayableID,
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