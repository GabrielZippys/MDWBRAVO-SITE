// pages/api/chamados.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }

  try {
    const databaseId = process.env.NOTION_DATABASE_ID!;
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Data de Criação',
          direction: 'descending',
        },
      ],
    });

    const chamados = response.results.map((page) => {
      const properties = page.properties;
      return {
        _id: page.id,
        titulo: properties['Título']?.title?.[0]?.plain_text || '',
        loja: properties['Loja']?.rich_text?.[0]?.plain_text || '',
        status: properties['Status']?.select?.name || '',
        tipo: properties['Tipo']?.select?.name || '',
        dataCriacao: properties['Data de Criação']?.date?.start || '',
        zona: properties['Zona']?.select?.name || '',
        prioridade: properties['Prioridade']?.select?.name || '',
      };
    });

    return res.status(200).json({ chamados });
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    return res.status(500).json({ message: 'Erro ao buscar chamados' });
  }
}
