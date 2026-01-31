import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getRelationship,
  updateRelationship,
  deleteRelationship,
  saveRelationships,
  Relationship,
} from '../../../lib/db/relationships';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.query;

  // key is [before, after] from URL like /api/relationships/Sign%20A/Sign%20B
  if (!Array.isArray(key) || key.length !== 2) {
    return res.status(400).json({ error: 'Invalid relationship key. Use /api/relationships/{before}/{after}' });
  }

  const [before, after] = key.map(decodeURIComponent);

  if (req.method === 'GET') {
    const rel = getRelationship(before, after);
    if (!rel) {
      return res.status(404).json({ error: 'Relationship not found' });
    }
    return res.status(200).json(rel);
  }

  if (req.method === 'PUT') {
    const body = req.body as Partial<Relationship>;

    if (!body.before || !body.after) {
      return res.status(400).json({ error: '"before" and "after" are required' });
    }

    const updated: Relationship = {
      before: body.before.trim(),
      after: body.after.trim(),
      references: Array.isArray(body.references) ? body.references : [],
    };

    const result = updateRelationship(before, after, updated);
    if (!result) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    saveRelationships();
    return res.status(200).json(result);
  }

  if (req.method === 'DELETE') {
    const deleted = deleteRelationship(before, after);
    if (!deleted) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    saveRelationships();
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
