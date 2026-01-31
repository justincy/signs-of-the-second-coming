import type { NextApiRequest, NextApiResponse } from 'next';
import { getGroups, addGroup, save, Group } from '../../../lib/db/groups';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(getGroups());
  }

  if (req.method === 'POST') {
    const { name, members } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const group: Group = {
      name: name.trim(),
      members: Array.isArray(members) ? members : [],
    };

    const result = addGroup(group);
    save();

    return res.status(201).json(result);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
