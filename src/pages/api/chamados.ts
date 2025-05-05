// pages/api/chamados.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Chamado from '@/models/chamado';
import { connectDB } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      // 1) usa .lean() para obter objetos JS simples
      const chamadosRaw = await Chamado.find().sort({ dataCriacao: -1 }).lean();

      // 2) mapeia para serializar o _id e limpar o objeto
      const chamados = chamadosRaw.map(c => ({
        _id: c.id.toString(),
        titulo: c.titulo,
        loja: c.loja,
        status: c.status,
        tipo: c.tipo,
        dataCriacao: c.dataCriacao?.toISOString() ?? null,
        zona: c.zona,
        prioridade: c.prioridade ?? null
      }));

      return res.status(200).json(chamados);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      return res.status(500).json({ message: 'Erro ao buscar chamados' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }
}
