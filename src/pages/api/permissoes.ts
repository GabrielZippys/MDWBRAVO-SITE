import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import UserPermission from '@/models/UserPermission';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    const permissoes = await UserPermission.find();
    return res.status(200).json(permissoes);
  }

  if (req.method === 'POST') {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: 'Email e role são obrigatórios' });

    const atualizado = await UserPermission.findOneAndUpdate(
      { email },
      { email, role },
      { upsert: true, new: true }
    );
    return res.status(200).json(atualizado);
  }

  if (req.method === 'DELETE') {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email é obrigatório' });

    await UserPermission.findOneAndDelete({ email });
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}
