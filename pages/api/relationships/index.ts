import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getRelationships,
  addRelationship,
  saveRelationships,
  Relationship,
} from '../../../lib/db/relationships';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(getRelationships());
  }

  if (req.method === 'POST') {
    const { before, after, references } = req.body;

    if (!before || typeof before !== 'string') {
      return res.status(400).json({ error: '"before" sign is required' });
    }
    if (!after || typeof after !== 'string') {
      return res.status(400).json({ error: '"after" sign is required' });
    }

    const rel: Relationship = {
      before: before.trim(),
      after: after.trim(),
      references: Array.isArray(references) ? references : [],
    };

    const result = addRelationship(rel);
    saveRelationships();

    return res.status(201).json(result);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
