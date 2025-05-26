// pages/api/chamados.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { notion } from '@/lib/notion';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

type ChamadoStatus = 'em aberto' | 'realizando' | 'designado' | 'interrompido';

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const STATUSES_IGNORADOS = new Set(['Feito', 'Resolvido', 'Concluído']);

// Mapeamento de status do Notion para nosso tipo
const statusMap: Record<string, ChamadoStatus> = {
  'Em aberto': 'em aberto',
  'Aberto': 'em aberto',
  'Interrompido': 'interrompido',
  'Realizando': 'realizando',
  'Designado': 'designado',
  'Default': 'em aberto'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }

  try {
    if (!process.env.NOTION_TOKEN || !DATABASE_ID) {
      throw new Error('Variáveis de ambiente não configuradas');
    }

    let allResults: PageObjectResponse[] = [];
    let cursor: string | undefined = undefined;

    // Paginação
    do {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        start_cursor: cursor,
        sorts: [{ property: 'Data De Criação', direction: 'descending' }]
      });
      allResults = [...allResults, ...(response.results as PageObjectResponse[])];
      cursor = response.has_more ? response.next_cursor! : undefined;
    } while (cursor);

    const chamados = allResults
      .filter(page => page.object === 'page')
      .map(page => {
        const props = page.properties as any;
        
        // Extração e normalização dos dados
        const rawLoja = props.Loja?.select?.name || '';
        const rawStatus = props.Status?.status?.name || 'Default';
        const status = statusMap[rawStatus] || 'outros';

        return {
          // A propriedade 'ID' foi removida daqui
          titulo: props['Descrição do Problema']?.title?.[0]?.plain_text || '',
          loja: rawLoja,
          status,
          tipo: props['Tipo de Ticket']?.select?.name || '',
          prioridade: props.Prioridade?.select?.name || '',
          dataCriacao: page.created_time,
          zona: getZona(rawLoja)
        };
      })
      .filter(c => !STATUSES_IGNORADOS.has(c.status as string)); // Cast para string para segurança

    return res.status(200).json(chamados);

  } catch (error) {
    // Tratamento seguro do tipo unknown
    let errorMessage = 'Erro desconhecido ao processar a requisição';
    let errorDetails: unknown = null;

    // Verificação de tipo para Error padrão
    if (error instanceof Error) {
        errorMessage = error.message;
        
        // Verificação adicional para erros com propriedade response 
        if (typeof error === 'object' && error !== null && 'response' in error) {
            const axiosError = error as { response?: { data?: unknown } };
            errorDetails = axiosError.response?.data;
        }
    }

    console.error('Erro na API:', error);
    
    return res.status(500).json({
        message: errorMessage,
        details: errorDetails
    });
  }

}
// Função auxiliar para mapear zonas
function getZona(nomeLoja: string): string {
    const zonaMap: Record<string, string> = {
        'SA': 'ZONA SUL',
        'ST': 'ZONA SUL',
        'GG': 'ZONA SUL',
        'PI': 'ZONA SUL',
        'BF': 'ZONA SUL',
        'CS': 'ZONA SUL',
        'PA': 'ZONA OESTE',
        'LE': 'ZONA OESTE',
        'CO': 'ZONA OESTE',
        'PE': 'ZONA OESTE',
        'LA': 'ZONA OESTE',
        'VI': 'ZONA NORTE',
        'TU': 'ZONA NORTE',
        'MA': 'ZONA NORTE',
        'CE': 'ZONA NORTE',
        'PR': 'ZONA NORTE',
        'IM': 'ZONA NORTE',
        'CA': 'ZONA LESTE',
        'SL': 'ZONA LESTE',
        'SM': 'ZONA LESTE',
        'GU': 'ZONA LESTE',
        'AR': 'ZONA LESTE',
        'CL': 'CENTRO'
    };

    const sigla = nomeLoja.match(/[A-Z]{2,}/)?.[0] || '';
    return zonaMap[sigla] || 'Não Mapeada';
}