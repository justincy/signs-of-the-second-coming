import fs from 'fs';
import signsData from '../../data/signs.json';

export type Sign = {
  name: string;
  references: string[];
}

// Mutable copy of signs
const signs: Sign[] = [...signsData];
const index: Record<string, Sign> = {};
signs.forEach(sign => {
  index[sign.name] = sign;
});

export function getSigns(): Sign[] {
  return [...signs];
}

export function getSign(name: string): Sign | undefined {
  return index[name];
}

export function addSign(sign: Sign) {
  // New sign
  if (!index[sign.name]) {
    signs.push(sign);
    index[sign.name] = sign;
  } 
  // Existing sign: merge references
  else {
    const dedupedRefs = new Set([...index[sign.name].references, ...sign.references]);
    index[sign.name].references = [...dedupedRefs];
  }
}

export function updateSign(oldName: string, updated: Sign): Sign | null {
  const existing = index[oldName];
  if (!existing) return null;

  // Find index in array
  const idx = signs.findIndex(s => s.name === oldName);
  if (idx === -1) return null;

  // If name changed, update index
  if (oldName !== updated.name) {
    delete index[oldName];
    // Check if new name already exists
    if (index[updated.name]) {
      // Merge into existing
      const target = index[updated.name];
      const dedupedRefs = new Set([...target.references, ...updated.references]);
      target.references = [...dedupedRefs];
      // Remove old entry
      signs.splice(idx, 1);
      return target;
    }
  }

  // Update in place
  signs[idx] = updated;
  index[updated.name] = updated;
  return updated;
}

export function deleteSign(name: string): boolean {
  const idx = signs.findIndex(s => s.name === name);
  if (idx === -1) return false;

  signs.splice(idx, 1);
  delete index[name];
  return true;
}

export function save() {
  fs.writeFileSync('data/signs.json', JSON.stringify(signs, null, 2));
}
