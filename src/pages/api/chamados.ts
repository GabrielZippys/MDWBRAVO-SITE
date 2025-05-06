// pages/api/chamados.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { notion } from '@/lib/notion';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

const STATUSES_IGNORADOS = new Set(['Feito', 'Resolvido', 'Concluído']);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }

  try {
    // Verificação básica das variáveis de ambiente
    if (!process.env.NOTION_TOKEN || !DATABASE_ID) {
      throw new Error('Variáveis de ambiente do Notion não configuradas');
    }

    // Testar conexão com o banco de dados
    const database = await notion.databases.retrieve({ database_id: DATABASE_ID });
    console.log('Conexão com Notion OK. Banco:', database.title);

    let allResults: PageObjectResponse[] = [];
    let cursor: string | undefined = undefined;

    do {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        start_cursor: cursor,
        sorts: [{ property: 'Data De Criação', direction: 'descending' }]
      });
      allResults = [...allResults, ...(response.results as PageObjectResponse[])];
      cursor = response.has_more ? response.next_cursor! : undefined;
    } while (cursor);

    console.log(`Total de páginas encontradas: ${allResults.length}`);

    const chamados = allResults
      .filter(page => {
        if (page.object !== 'page') {
          console.warn('Item não é uma página:', page.id);
          return false;
        }
        return true;
      })
      .map(page => {
        const props = page.properties as any;
        
        // Debug: Logar todas as propriedades
        console.log(`Propriedades da página ${page.id}:`, JSON.stringify(props, null, 2));

        const status = props.Status?.status?.name || 'Sem status';
        const loja = props.Loja?.select?.name || '';
        
        return {
          _id: page.id,
          titulo: props['Descrição do Problema']?.title?.[0]?.plain_text || '',
          loja,
          status,
          tipo: props['Tipo de Ticket']?.select?.name || '',
          prioridade: props.Prioridade?.select?.name || '',
          dataCriacao: page.created_time,
          zona: getZona(loja)
        };
      })
      .filter(c => !STATUSES_IGNORADOS.has(c.status));

    console.log(`Chamados filtrados: ${chamados.length}`);
    return res.status(200).json(chamados);

  } catch (error) {
    console.error('Erro detalhado:', error);
    return res.status(500).json({ 
      message: 'Erro ao buscar chamados do Notion',
      error: error.message,
      details: error.response?.data || null
    });
  }
}

function getZona(lojaSigla: string) {
  const map: Record<string, string> = {
    BO: 'Centro', 
    NS: 'Oeste',
    // Adicione todas as siglas necessárias
  };
  return lojaSigla ? map[lojaSigla.toUpperCase()] || 'Não Mapeada' : 'Sem Loja';
}