import fs from 'fs';
import path from 'path';
import relationshipsData from '../../data/relationships.json';

export type Relationship = {
  before: string;
  after: string;
  references: string[];
};

// Mutable copy
const relationships: Relationship[] = [...relationshipsData];

// Create composite key for indexing
function makeKey(before: string, after: string): string {
  return `${before}|||${after}`;
}

const index: Record<string, Relationship> = {};
relationships.forEach(rel => {
  index[makeKey(rel.before, rel.after)] = rel;
});

export function getRelationships(): Relationship[] {
  return [...relationships];
}

export function getRelationship(before: string, after: string): Relationship | undefined {
  return index[makeKey(before, after)];
}

export function addRelationship(rel: Relationship): Relationship {
  const key = makeKey(rel.before, rel.after);
  
  if (!index[key]) {
    relationships.push(rel);
    index[key] = rel;
  } else {
    // Merge references if relationship exists
    const existing = index[key];
    const dedupedRefs = new Set([...existing.references, ...rel.references]);
    existing.references = [...dedupedRefs];
  }
  
  return index[key];
}

export function updateRelationship(
  oldBefore: string,
  oldAfter: string,
  updated: Relationship
): Relationship | null {
  const oldKey = makeKey(oldBefore, oldAfter);
  const existing = index[oldKey];
  if (!existing) return null;

  const idx = relationships.findIndex(
    r => r.before === oldBefore && r.after === oldAfter
  );
  if (idx === -1) return null;

  const newKey = makeKey(updated.before, updated.after);

  // If key changed, check for conflicts
  if (oldKey !== newKey) {
    delete index[oldKey];
    
    if (index[newKey]) {
      // Merge into existing
      const target = index[newKey];
      const dedupedRefs = new Set([...target.references, ...updated.references]);
      target.references = [...dedupedRefs];
      relationships.splice(idx, 1);
      return target;
    }
  }

  relationships[idx] = updated;
  index[newKey] = updated;
  return updated;
}

export function deleteRelationship(before: string, after: string): boolean {
  const key = makeKey(before, after);
  const idx = relationships.findIndex(
    r => r.before === before && r.after === after
  );
  
  if (idx === -1) return false;

  relationships.splice(idx, 1);
  delete index[key];
  return true;
}

export function saveRelationships() {
  const filePath = path.join(process.cwd(), 'data/relationships.json');
  fs.writeFileSync(filePath, JSON.stringify(relationships, null, 2));
}

// Alias for backward compatibility with import-signs
export const save = saveRelationships;

// Helper to add a single reference to a relationship
export function addReference(before: string, after: string, reference: string) {
  const key = makeKey(before, after);
  
  if (!index[key]) {
    const rel: Relationship = { before, after, references: [reference] };
    relationships.push(rel);
    index[key] = rel;
  } else {
    const existing = index[key];
    if (!existing.references.includes(reference)) {
      existing.references.push(reference);
    }
  }
}
