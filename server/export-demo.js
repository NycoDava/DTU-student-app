/**
 * Copies the anonymized output of the last sync (server/cache/app-data.demo.json, made with ANON=1) to
 * public/data/app-data.json: the demo data used by the static build and by the app when the server is off.
 *   npm run demo-data
 */
import { copyFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(HERE, 'cache', 'app-data.demo.json');
const dest = path.join(HERE, '..', 'public', 'data', 'app-data.json');

const demo = JSON.parse(await readFile(src, 'utf8').catch(() => 'null'));
if (!demo) {
  console.error('No server/cache/app-data.demo.json yet: log in and refresh once with the server running.');
  process.exit(1);
}
// Safety check: everyone except the author must have a fictional @example.com address.
const leaked = Object.values(demo.classlists || {}).flatMap((c) => c.people || []).filter((p) => !p.isMe && p.email && !p.email.endsWith('@example.com'));
if (leaked.length) {
  console.error(`Refusing to export: ${leaked.length} classlist entries are not anonymized.`);
  process.exit(1);
}
await copyFile(src, dest);
console.log(`Demo data exported to public/data/app-data.json (fetchedAt ${demo.fetchedAt}).`);
