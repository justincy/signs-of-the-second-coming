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
  if (!index[sign.name]) {
    signs.push(sign);
    index[sign.name] = sign;
  } else {
    index[sign.name].references.push(sign.references[0]);
  }
}

export function save() {
  fs.writeFileSync('data/signs.json', JSON.stringify(signs, null, 2));
}