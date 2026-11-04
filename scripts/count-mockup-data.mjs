import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const filePath = resolve(process.cwd(), process.argv[2] ?? 'mockup.json');
const data = JSON.parse(await readFile(filePath, 'utf8'));

function countRecords(value) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') {
    return Object.values(value).reduce((sum, item) => sum + countRecords(item), 0);
  }
  return 0;
}

let total = 0;
for (const [key, value] of Object.entries(data)) {
  const count = Array.isArray(value) ? value.length : 0;
  total += count;
  console.log(`${key}: ${count}${Array.isArray(value) ? '' : ' (not a collection)'}`);
}

console.log(`Total array entries: ${total}`);
console.log(`Total nested records (arrays throughout JSON): ${countRecords(data)}`);
