import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  save,
  Group,
} from '../../../lib/db/groups';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;

  if (typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid group name' });
  }

  const decodedName = decodeURIComponent(name);

  // GET - fetch single group
  if (req.method === 'GET') {
    const group = getGroup(decodedName);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    return res.status(200).json(group);
  }

  // PUT - update group
  if (req.method === 'PUT') {
    const { name: newName, members } = req.body;

    if (!newName || typeof newName !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const updated: Group = {
      name: newName.trim(),
      members: Array.isArray(members) ? members : [],
    };

    const result = updateGroup(decodedName, updated);
    if (!result) {
      return res.status(404).json({ error: 'Group not found' });
    }

    save();
    return res.status(200).json(result);
  }

  // PATCH - add or remove members
  if (req.method === 'PATCH') {
    const { action, member } = req.body;

    if (!member || typeof member !== 'string') {
      return res.status(400).json({ error: 'Member name is required' });
    }

    let result: Group | null = null;

    if (action === 'add') {
      result = addMember(decodedName, member.trim());
    } else if (action === 'remove') {
      result = removeMember(decodedName, member.trim());
    } else {
      return res.status(400).json({ error: 'Action must be "add" or "remove"' });
    }

    if (!result) {
      return res.status(404).json({ error: 'Group not found' });
    }

    save();
    return res.status(200).json(result);
  }

  // DELETE - remove group
  if (req.method === 'DELETE') {
    const deleted = deleteGroup(decodedName);
    if (!deleted) {
      return res.status(404).json({ error: 'Group not found' });
    }

    save();
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
