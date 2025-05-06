// pages/api/chamados.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { notion } from '@/lib/notion';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

const STATUSES_IGNORADOS = new Set(['Feito', 'Resolvido', 'Concluído']);

// pages/api/chamados.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }

  try {
    // Verificação das variáveis de ambiente
    if (!process.env.NOTION_TOKEN || !DATABASE_ID) {
      throw new Error('Variáveis de ambiente do Notion não configuradas');
    }

    // Testar conexão com tipo correto
    const database = await notion.databases.retrieve({ 
      database_id: DATABASE_ID 
    }) as any; // Type assertion temporário

    console.log('Conexão com Notion OK. Banco:', 
      database.title[0]?.plain_text || 'Sem nome'
    );

    // Restante do código de paginação...

  } catch (error) {
    let errorMessage = 'Erro desconhecido';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Erro detalhado:', error);
    return res.status(500).json({ 
      message: 'Erro ao buscar chamados do Notion',
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : null : undefined
    });
  }
}