// pages/api/chamados.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { notion } from '@/lib/notion';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

// Status a ignorar
const STATUSES_IGNORADOS = new Set(['Feito', 'Resolvido', 'Concluído']);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }

  try {
    let allResults: PageObjectResponse[] = [];
    let cursor: string | undefined = undefined;

    // Paginação
    do {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        start_cursor: cursor,
        sorts: [{ property: 'dataCriacao', direction: 'descending' }],
      });
      allResults.push(...(response.results as PageObjectResponse[]));
      cursor = response.has_more ? response.next_cursor! : undefined;
    } while (cursor);

    const chamados = allResults
      .filter(page => page.object === 'page')
      .map(page => {
        const p = page.properties as any;
        const status = p.Status?.status?.name || 'Sem status';
        return {
          _id: page.id,
          titulo: p['Descrição do Problema']?.title?.[0]?.plain_text || '',
          loja: p.Loja?.select?.name || '',
          status,
          tipo: p['Tipo de Ticket']?.select?.name || '',
          prioridade: p.Prioridade?.select?.name || '',
          dataCriacao: page.created_time,     // ISO string
          zona: p.Loja?.select?.name
            ? getZona(p.Loja.select.name)
            : 'Não Mapeada'
        };
      })
      .filter(c => !STATUSES_IGNORADOS.has(c.status));

    return res.status(200).json(chamados);
  } catch (error) {
    console.error('Erro ao buscar chamados do Notion:', error);
    return res.status(500).json({ message: 'Erro ao buscar chamados do Notion' });
  }
}

// Função de exemplo — ajuste a lógica conforme seu config.json
function getZona(lojaSigla: string) {
  const map: Record<string, string> = {
    BO: 'Centro', NS: 'Oeste', /* ... resto das siglas ... */
  };
  return map[lojaSigla.toUpperCase()] || 'Não Mapeada';
}
