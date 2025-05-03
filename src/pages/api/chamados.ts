import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import Chamado from '@/models/chamado';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    const chamados = await Chamado.find().sort({ dataCriacao: -1 });
    return res.status(200).json(chamados);
  }

  res.status(405).json({ message: 'Método não permitido' });
}
