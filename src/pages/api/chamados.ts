// pages/api/chamados.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY! });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

// Status a ignorar
const STATUSES_IGNORADOS = new Set(['Feito', 'Resolvido', 'Concluído']);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Busca paginada de todas as páginas
    const results: any[] = [];
    let cursor: string | undefined = undefined;
    do {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        start_cursor: cursor,
      });
      results.push(...response.results);
      cursor = response.has_more ? response.next_cursor! : undefined;
    } while (cursor);

    // Filtra e mapeia para o formato de ChamadoType
    const chamados = results
      .map(page => {
        const props = page.properties as any;
        const status = props.Status?.status?.name || 'Sem status';
        return {
          _id: page.id,
          titulo: props['Descrição do Problema']?.title?.[0]?.plain_text || 'Sem título',
          loja: props.Loja?.select?.name || 'Não definida',
          status,
          tipo: props['Tipo de Ticket']?.select?.name || 'Não definido',
          prioridade: props.Prioridade?.select?.name || null,
          dataCriacao: page.created_time,
          zona: '—', // se precisar lógica de zona, reinsira aqui
        };
      })
      // remove aqueles com status ignorado
      .filter((c) => !STATUSES_IGNORADOS.has(c.status));

    res.status(200).json(chamados);
  } catch (error) {
    console.error('Erro ao buscar chamados do Notion:', error);
    res.status(500).json({ message: 'Erro ao buscar chamados' });
  }
}
