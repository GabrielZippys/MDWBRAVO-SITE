import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import Chamado from '@/models/chamado';
import fetchNotionData from '@/utils/fetchNotion';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Use método POST' });
  }

  await connectDB();

  try {
    const chamados = await fetchNotionData();

    for (const chamado of chamados) {
      await Chamado.findOneAndUpdate(
        { titulo: chamado.titulo, loja: chamado.loja },
        chamado,
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({ message: `${chamados.length} chamados sincronizados.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao sincronizar com Notion' });
  }
}
