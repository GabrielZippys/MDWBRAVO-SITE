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
  process.env.NOTION_PROJECTS_DATABASE_ID || 'a2982b0a81ff4378a8d6159012d6cfa6'; // Confirme seu Database ID

export interface Projeto {
  pageId: string;
  numeroChamado: string | null; // Para a coluna "Nº ID" ou similar que você quer exibir
  nome: string;                 // Virá de "Descrição do Problema" ou "Nome do projeto"
  loja: string | null;
  status: string;
  tipo: string | null;
  resumo: string | null;
  setor: string;
  prioridade: string;
  cliente: string | null;
  criadoEm: string;
  link: string | null;
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

      // NOME (Título principal do chamado)
      // Verifique no log se "Descrição do Problema" existe e seu tipo.
      // Se "Descrição do Problema" for a propriedade 'title', use a primeira lógica.
      // Se for 'rich_text', a segunda é melhor.
      let nome: string | null = null;
      const descricaoProblemaProp = properties['Descrição do Problema']; // << NOME DA SUA COLUNA DE TÍTULO/DESCRIÇÃO PRINCIPAL
      const nomeDoProjetoProp = properties['Nome do projeto'] as Extract<PagePropertyValue, { type: 'title' }> | undefined; // Fallback

      if (descricaoProblemaProp && descricaoProblemaProp.type === 'title') {
        nome = descricaoProblemaProp.title?.[0]?.plain_text?.trim();
      } else if (descricaoProblemaProp && descricaoProblemaProp.type === 'rich_text') {
        nome = getRichTextValue(descricaoProblemaProp);
      }
      // Fallback para "Nome do projeto" se "Descrição do Problema" não for encontrada ou estiver vazia
      if (!nome && nomeDoProjetoProp) {
        nome = nomeDoProjetoProp.title?.[0]?.plain_text?.trim();
      }
      nome = nome || 'Sem nome';


      // NÚMERO DO CHAMADO (ID de Exibição)
      let numeroChamado: string | null = null;
      // <<<< IMPORTANTE: SUBSTITUA 'NOME_DA_COLUNA_ID_NO_SEU_LOG' PELO NOME EXATO DA SUA COLUNA "Nº ID" (ou similar) QUE APARECE NO LOG. >>>>
      const idProperty = properties['NOME_DA_COLUNA_ID_NO_SEU_LOG']; 
      if (idProperty) {
        if (idProperty.type === 'unique_id') { // Tipo "ID" do Notion
          numeroChamado = getNotionUniqueIdValue(idProperty);
        } else if (idProperty.type === 'number') { // Tipo "Número"
          numeroChamado = getNumberValueAsString(idProperty);
        } else if (idProperty.type === 'rich_text' || idProperty.type === 'title') { // Tipo "Texto" ou "Título"
          numeroChamado = getRichTextValue(idProperty);
        } else {
          console.warn(`Propriedade para numeroChamado ('${'NOME_DA_COLUNA_ID_NO_SEU_LOG'}') tem tipo inesperado: ${idProperty.type} na página ${page.id}.`);
        }
      }
      numeroChamado = numeroChamado || null;

      // TIPO
      // <<<< IMPORTANTE: SUBSTITUA 'NOME_DA_COLUNA_TIPO_NO_SEU_LOG' PELO NOME EXATO E VERIFIQUE O TIPO >>>>
      const tipoProperty = properties['NOME_DA_COLUNA_TIPO_NO_SEU_LOG'];
      const tipo = getSelectValue(tipoProperty) || getStatusValue(tipoProperty) || getRichTextValue(tipoProperty) || null;

      // LOJA
      // <<<< IMPORTANTE: SUBSTITUA 'NOME_DA_COLUNA_LOJA_NO_SEU_LOG' PELO NOME EXATO E VERIFIQUE O TIPO >>>>
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
        numeroChamado,
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