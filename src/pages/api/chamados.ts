// pages/api/chamados.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import Chamado from '@/models/chamado';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
    const chamados = await Chamado.find().sort({ dataCriacao: -1 });

    const formatados = chamados.map((c) => ({
      _id: c._id.toString(),
      titulo: c.titulo,
      loja: c.loja,
      status: c.status,
      tipo: c.tipo,
      dataCriacao: c.dataCriacao.toISOString(),
      zona: c.zona,
      prioridade: c.prioridade ?? null,
    }));

    res.status(200).json(formatados);
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    res.status(500).json({ message: 'Erro ao buscar chamados' });
  }
}
