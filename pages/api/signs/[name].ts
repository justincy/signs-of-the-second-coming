import type { NextApiRequest, NextApiResponse } from 'next';
import { getSigns, updateSign, deleteSign, save } from '../../../lib/db/signs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  const signName = decodeURIComponent(name as string);
  
  const signs = getSigns();
  const sign = signs.find(s => s.name === signName);

  if (req.method === 'GET') {
    if (!sign) {
      return res.status(404).json({ error: 'Sign not found' });
    }
    return res.status(200).json(sign);
  }

  if (req.method === 'PUT') {
    if (!sign) {
      return res.status(404).json({ error: 'Sign not found' });
    }

    const { name: newName, references } = req.body;
    
    const updated = updateSign(signName, {
      name: newName?.trim() || signName,
      references: Array.isArray(references) ? references : sign.references
    });
    save();

    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    if (!sign) {
      return res.status(404).json({ error: 'Sign not found' });
    }

    deleteSign(signName);
    save();

    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
