import type { NextApiRequest, NextApiResponse } from 'next';
import { notion } from '@/lib/notion';

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        sorts: [{ property: 'dataCriacao', direction: 'descending' }],
      });

      const chamados = response.results.map((page) => {
        const properties = page.properties;
        return {
          _id: page.id,
          titulo: properties.titulo?.title[0]?.plain_text || '',
          loja: properties.loja?.select?.name || '',
          status: properties.status?.select?.name || '',
          tipo: properties.tipo?.select?.name || '',
          dataCriacao: properties.dataCriacao?.date?.start || '',
          zona: properties.zona?.select?.name || '',
          prioridade: properties.prioridade?.select?.name || '',
        };
      });

      res.status(200).json(chamados);
    } catch (error) {
      console.error('Erro ao buscar chamados do Notion:', error);
      res.status(500).json({ message: 'Erro ao buscar chamados do Notion' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}
