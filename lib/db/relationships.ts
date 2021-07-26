import fs from 'fs';
import relationships from '../../data/relationships.json';

export type Relationship = {
  before: string;
  after: string;
  references: string[];
}

const index: Record<string, string[]> = {};
relationships.forEach(addRelationshipToIndex)

function getRelKey(rel: Relationship) {
  return `${rel.before}::${rel.after}`;
}

function addRelationshipToIndex(relationship: Relationship) {
  const key = getRelKey(relationship);
  index[getRelKey(relationship)] = relationship.references;
}

function relKeyExists(key: string) {
  return !!index[key];
}

export function getRelationships(): Relationship[] {
  return [...relationships];
}

export function addRelationship(relationship: Relationship) {
  relationships.push(relationship);
  addRelationshipToIndex(relationship);
}

export function addReference(before: string, after: string, reference: string) {
  const newRel = { before, after, references: [reference] };
  const key = getRelKey(newRel);
  
  // If the relationship already exists, update the references
  if (relKeyExists(key)) {
    if (!index[key].includes(reference)) {
      index[key].push(reference);
    }
  }

  // Otherwise, create a new relationship
  else {
    addRelationship(newRel);
  }
}

export function save() {
  fs.writeFileSync('data/relationships.json', JSON.stringify(relationships, null, 2));
}