import fs from 'fs';
import signs from '../../data/signs.json';

export type Sign = {
  name: string;
  references: string[];
}

export function getSigns(): Sign[] {
  return [...signs];
}

export function addSign(sign: Sign) {
  signs.push(sign);
}

export function save() {
  fs.writeFileSync('data/signs.json', JSON.stringify(signs, null, 2));
}