import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getSynonym,
  updateSynonym,
  deleteSynonym,
  save,
  Synonym,
} from '../../../lib/db/synonyms';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { duplicate } = req.query;

  if (typeof duplicate !== 'string') {
    return res.status(400).json({ error: 'Invalid duplicate name' });
  }

  const decodedDuplicate = decodeURIComponent(duplicate);

  // GET - fetch single synonym
  if (req.method === 'GET') {
    const syn = getSynonym(decodedDuplicate);
    if (!syn) {
      return res.status(404).json({ error: 'Synonym not found' });
    }
    return res.status(200).json(syn);
  }

  // PUT - update synonym
  if (req.method === 'PUT') {
    const { duplicate: newDuplicate, synonym } = req.body;

    if (!newDuplicate || typeof newDuplicate !== 'string') {
      return res.status(400).json({ error: 'Duplicate name is required' });
    }

    if (!synonym || typeof synonym !== 'string') {
      return res.status(400).json({ error: 'Synonym (canonical sign) is required' });
    }

    const updated: Synonym = {
      duplicate: newDuplicate.trim(),
      synonym: synonym.trim(),
    };

    const result = updateSynonym(decodedDuplicate, updated);
    if (!result) {
      return res.status(404).json({ error: 'Synonym not found' });
    }

    save();
    return res.status(200).json(result);
  }

  // DELETE - remove synonym
  if (req.method === 'DELETE') {
    const deleted = deleteSynonym(decodedDuplicate);
    if (!deleted) {
      return res.status(404).json({ error: 'Synonym not found' });
    }

    save();
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
