import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const notion = new Client({ auth: process.env.NOTION_TOKEN! });

const databaseId =
  process.env.NOTION_PROJECTS_DATABASE_ID || 'a2982b0a81ff4378a8d6159012d6cfa6';

// Interface Projeto existente
export interface Projeto {
  id: string;
  nome: string;
  resumo: string;
  status: string;
  setor: string;
  prioridade: string;
  cliente: string;
  criadoEm: string;
  link?: string;
  proprietario: { nome: string } | { nome: string }[] | null;
}

// Função para obter nome do usuário de forma segura
function getUserName(user: any): string {
  if (!user) return 'Sem responsável';
  if ('name' in user && user.name) {
    return user.name;
  }
  return user.id ? `Usuário ${user.id}` : 'Sem responsável';
}

// Função para validar URLs
function isValidUrl(url: string | null): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Função utilitária para extrair texto de rich_text com segurança
function getRichTextValue(prop: any): string {
  return prop?.type === 'rich_text' && prop.rich_text?.[0]?.plain_text
    ? prop.rich_text[0].plain_text
    : '';
}

// Type guard para propriedades do tipo 'select'
function isSelectProperty(prop: any): prop is { type: 'select'; select: { name: string } | null } {
  return prop?.type === 'select';
}

// Type guard para propriedades do tipo 'status'
function isStatusProperty(prop: any): prop is { type: 'status'; status: { name: string } | null } {
  return prop?.type === 'status';
}

export async function getProjetosFromNotion(): Promise<Projeto[]> {
  try {
    console.log('Iniciando busca de projetos no Notion, database ID:', databaseId);

    const response = await notion.databases.query({
      database_id: databaseId,
    });

    console.log(`Encontrados ${response.results.length} resultados no Notion`);

    const pages = response.results.filter(
      (page): page is PageObjectResponse => 'properties' in page
    );

    if (pages.length > 0) {
      const firstPage = pages[0];
      console.log(
        'Exemplo de propriedades disponíveis:',
        Object.keys(firstPage.properties).map((key) => ({
          key,
          type: (firstPage.properties[key] as any).type,
        }))
      );
    }

    const statusValidos = ['Planejamento', 'Em andamento', 'Em pausa'];
    const setoresValidos = ['Infra', 'Infra & BI'];

    const projetos: Projeto[] = pages.map((page) => {
      const titleProp = Object.values(page.properties).find(
        (prop: any) => prop.type === 'title'
      ) as any;

      const nome = titleProp?.title?.[0]?.plain_text?.trim() || 'Sem nome';

      const descricao = getRichTextValue(page.properties.Descrição);
      const resumo = getRichTextValue(page.properties.Resumo);

      const imageProp =
        page.properties['Arquivos e mídia'] || page.properties.Imagem;
      let imagem: string | null = null;

      if (imageProp?.type === 'files' && imageProp.files.length > 0) {
        const file = imageProp.files[0];
        if (file?.type === 'file') {
  imagem = file.file.url;
} else if (file?.type === 'external') {
  imagem = file.external.url;
}

      }

      const linkProp = page.properties.Link as any;
      const link = linkProp?.url && isValidUrl(linkProp.url) ? linkProp.url : null;

      let status = 'Sem status';
      const statusProp = page.properties.Status;
      if (isStatusProperty(statusProp)) {
        status = statusProp.status?.name || 'Sem status';
      } else if (isSelectProperty(statusProp)) {
        status = statusProp.select?.name || 'Sem status';
      }

      const setorProp = page.properties.Setor;
      const setor =
        isSelectProperty(setorProp) && setorProp.select?.name
          ? setorProp.select.name
          : 'Indefinido';

     let proprietario: { nome: string }[] | null = null;
const proprietarioProp = page.properties.Proprietário;
if (proprietarioProp?.type === 'people' && proprietarioProp.people.length > 0) {
  proprietario = proprietarioProp.people.map((user: any) => ({
    nome: getUserName(user),
  }));
}

      const prioridadeProp = page.properties.Prioridade;
      const prioridade =
        isSelectProperty(prioridadeProp) && prioridadeProp.select?.name
          ? prioridadeProp.select.name
          : 'Sem prioridade';

      const clienteProp = page.properties.Cliente;
      const cliente =
        isSelectProperty(clienteProp) && clienteProp.select?.name
          ? clienteProp.select.name
          : 'Sem cliente';

let responsavel: string = 'Sem responsável';
const responsavelProp = page.properties.Responsável;
if (responsavelProp?.type === 'people' && responsavelProp.people.length > 0) {
  responsavel = getUserName(responsavelProp.people[0]);
}


      const criadoEm = page.created_time || '';

      return {
        id: page.id,
        nome,
        descricao,
        imagem,
        link,
        status,
        setor,
        proprietario,
        criadoEm,
        resumo,
        prioridade,
        cliente,
        responsavel,
      };
    });

    const projetosFiltrados = projetos.filter(
      (p) => statusValidos.includes(p.status) && setoresValidos.includes(p.setor)
    );

    console.log(`Retornando ${projetosFiltrados.length} projetos filtrados`);
    return projetosFiltrados;
  } catch (error) {
    console.error('Erro ao buscar projetos do Notion:', error);
    return [];
  }
}
