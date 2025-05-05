import type { NextApiRequest, NextApiResponse } from 'next';
import Chamado from '@/models/chamado';
import { connectDB } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const chamados = await Chamado.find().sort({ dataCriacao: -1 });
      res.status(200).json(chamados);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar chamados', error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}
