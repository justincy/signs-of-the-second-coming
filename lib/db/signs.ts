import fs from 'fs';
import signs from '../../data/signs.json';

export type Sign = {
  name: string;
  references: string[];
}

const index: Record<string, Sign> = {};
signs.forEach(sign => {
  index[sign.name] = sign;
});

export function getSigns(): Sign[] {
  return [...signs];
}

export function addSign(sign: Sign) {
  // New sign
  if (!index[sign.name]) {
    signs.push(sign);
    index[sign.name] = sign;
  } 
  // We have an existing sign. Merge the two signs together.
  else {
    const dedupedRefs = new Set([...index[sign.name].references, ...sign.references]);
    index[sign.name].references = [...dedupedRefs];
  }
}

export function save() {
  fs.writeFileSync('data/signs.json', JSON.stringify(signs, null, 2));
}