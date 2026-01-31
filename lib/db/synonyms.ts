import fs from 'fs';
import path from 'path';
import synonymsData from '../../data/synonyms.json';

export type Synonym = {
  duplicate: string;
  synonym: string;
};

// Mutable copy
const synonyms: Synonym[] = [...synonymsData];
const index: Record<string, Synonym> = {};
synonyms.forEach(s => {
  index[s.duplicate] = s;
});

export function getSynonyms(): Synonym[] {
  return [...synonyms];
}

export function getSynonym(duplicate: string): Synonym | undefined {
  return index[duplicate];
}

export function addSynonym(syn: Synonym): Synonym {
  if (!index[syn.duplicate]) {
    synonyms.push(syn);
    index[syn.duplicate] = syn;
  } else {
    // Update existing
    index[syn.duplicate].synonym = syn.synonym;
  }
  return index[syn.duplicate];
}

export function updateSynonym(oldDuplicate: string, updated: Synonym): Synonym | null {
  const existing = index[oldDuplicate];
  if (!existing) return null;

  const idx = synonyms.findIndex(s => s.duplicate === oldDuplicate);
  if (idx === -1) return null;

  // If duplicate name changed, update index
  if (oldDuplicate !== updated.duplicate) {
    delete index[oldDuplicate];

    // Check if new duplicate already exists
    if (index[updated.duplicate]) {
      // Update existing entry's synonym target
      index[updated.duplicate].synonym = updated.synonym;
      synonyms.splice(idx, 1);
      return index[updated.duplicate];
    }
  }

  // Update in place
  synonyms[idx] = updated;
  index[updated.duplicate] = updated;
  return updated;
}

export function deleteSynonym(duplicate: string): boolean {
  const idx = synonyms.findIndex(s => s.duplicate === duplicate);
  if (idx === -1) return false;

  synonyms.splice(idx, 1);
  delete index[duplicate];
  return true;
}

export function saveSynonyms() {
  const filePath = path.join(process.cwd(), 'data/synonyms.json');
  fs.writeFileSync(filePath, JSON.stringify(synonyms, null, 2));
}

export const save = saveSynonyms;

// Get all synonyms that map to a given canonical sign
export function getSynonymsFor(canonicalSign: string): Synonym[] {
  return synonyms.filter(s => s.synonym === canonicalSign);
}

// Get the canonical sign for a duplicate (resolves chains)
export function resolve(name: string): string {
  let current = name;
  const visited = new Set<string>();
  
  while (index[current] && !visited.has(current)) {
    visited.add(current);
    current = index[current].synonym;
  }
  
  return current;
}
