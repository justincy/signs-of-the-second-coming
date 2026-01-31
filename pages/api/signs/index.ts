import type { NextApiRequest, NextApiResponse } from 'next';
import { getSigns, addSign, save, Sign } from '../../../lib/db/signs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(getSigns());
  }

  if (req.method === 'POST') {
    const { name, references } = req.body;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const sign: Sign = {
      name: name.trim(),
      references: Array.isArray(references) ? references : []
    };

    addSign(sign);
    save();

    return res.status(201).json(sign);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
