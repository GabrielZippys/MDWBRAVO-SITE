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
        const rawLoja = props.Loja?.select?.name || '';
        const loja = rawLoja.replace(/[^A-Z]/g, ''); // Remove não-letras

        // Debug: Logar todas as propriedades
        console.log(`Propriedades da página ${page.id}:`, JSON.stringify(props, null, 2));

        const status = props.Status?.status?.name || 'Sem status';
        
        return {
          _id: page.id,
          titulo: props['Descrição do Problema']?.title?.[0]?.plain_text || '',
          loja: rawLoja,
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

function getZona(nomeLoja: string): string {
  const zonaMap: Record<string, string> = {
    "BO": "Centro", "CA": "Centro", "CF": "Centro", "FC": "Centro",
    "LV": "Centro", "MO": "Sul", "PC": "Centro", "VM": "Sul",
    "PV": "Centro", "CB": "Centro", "RC": "Leste", "SD": "Leste",
    "CN": "Leste", "DJ": "Leste", "BB": "Oeste", "CL": "Oeste",
    "CR": "Sul", "HM": "Oeste", "JS": "Oeste", "PP": "Oeste",
    "NN": "Oeste", "NT": "Sul", "PI": "Sul", "JR": "Oeste",
    "SP": "Oeste", "TA": "Oeste", "JB": "Oeste", "NS": "Oeste",
    "TS": "Oeste", "JA": "Oeste", "RP": "Oeste", "EL": "Centro",
    "MA": "Centro", "JM": "Oeste", "DD": "Oeste", "SS": "Centro",
    "BU": "Centro"
  };

  // Extrai a sigla usando regex aprimorado
  const match = nomeLoja.match(/^[A-Z]{2,}/); // Captura 2+ letras no início
  const sigla = match ? match[0].toUpperCase() : '';

  // Log para debug
  console.log(`Processando loja: ${nomeLoja} | Sigla: ${sigla} | Zona: ${zonaMap[sigla] || 'Não Mapeada'}`);

  return zonaMap[sigla] || 'Não Mapeada';
}