import fs from 'fs';
import path from 'path';
import groupsData from '../../data/groups.json';

export type Group = {
  name: string;
  members: string[];
};

// Mutable copy
const groups: Group[] = [...groupsData];
const index: Record<string, Group> = {};
groups.forEach(group => {
  index[group.name] = group;
});

export function getGroups(): Group[] {
  return [...groups];
}

export function getGroup(name: string): Group | undefined {
  return index[name];
}

export function addGroup(group: Group): Group {
  if (!index[group.name]) {
    groups.push(group);
    index[group.name] = group;
  } else {
    // Merge members if group exists
    const existing = index[group.name];
    const dedupedMembers = new Set([...existing.members, ...group.members]);
    existing.members = [...dedupedMembers];
  }
  return index[group.name];
}

export function updateGroup(oldName: string, updated: Group): Group | null {
  const existing = index[oldName];
  if (!existing) return null;

  const idx = groups.findIndex(g => g.name === oldName);
  if (idx === -1) return null;

  // If name changed, update index
  if (oldName !== updated.name) {
    delete index[oldName];
    
    // Check if new name already exists
    if (index[updated.name]) {
      // Merge into existing
      const target = index[updated.name];
      const dedupedMembers = new Set([...target.members, ...updated.members]);
      target.members = [...dedupedMembers];
      groups.splice(idx, 1);
      return target;
    }
  }

  // Update in place
  groups[idx] = updated;
  index[updated.name] = updated;
  return updated;
}

export function deleteGroup(name: string): boolean {
  const idx = groups.findIndex(g => g.name === name);
  if (idx === -1) return false;

  groups.splice(idx, 1);
  delete index[name];
  return true;
}

export function saveGroups() {
  const filePath = path.join(process.cwd(), 'data/groups.json');
  fs.writeFileSync(filePath, JSON.stringify(groups, null, 2));
}

// Alias for consistency
export const save = saveGroups;

// Helper to add a member to a group
export function addMember(groupName: string, member: string): Group | null {
  if (!index[groupName]) return null;
  
  const group = index[groupName];
  if (!group.members.includes(member)) {
    group.members.push(member);
  }
  return group;
}

// Helper to remove a member from a group
export function removeMember(groupName: string, member: string): Group | null {
  if (!index[groupName]) return null;
  
  const group = index[groupName];
  const idx = group.members.indexOf(member);
  if (idx !== -1) {
    group.members.splice(idx, 1);
  }
  return group;
}
