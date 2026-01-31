import type { NextApiRequest, NextApiResponse } from 'next';
import { getSynonyms, addSynonym, save, Synonym } from '../../../lib/db/synonyms';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(getSynonyms());
  }

  if (req.method === 'POST') {
    const { duplicate, synonym } = req.body;

    if (!duplicate || typeof duplicate !== 'string') {
      return res.status(400).json({ error: 'Duplicate name is required' });
    }

    if (!synonym || typeof synonym !== 'string') {
      return res.status(400).json({ error: 'Synonym (canonical sign) is required' });
    }

    const syn: Synonym = {
      duplicate: duplicate.trim(),
      synonym: synonym.trim(),
    };

    const result = addSynonym(syn);
    save();

    return res.status(201).json(result);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
