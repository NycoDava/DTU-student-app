/**
 * Copies the anonymized output of the last sync (server/cache/app-data.demo.json, made with ANON=1) to
 * public/data/app-data.json: the demo data used by the static build and by the app when the server is off.
 *   npm run demo-data              -> no profile photo in the demo (initials)
 *   npm run demo-data -- --photo   -> also the profile photo, taken from the running local server (log in first).
 *                                     Opt-in because the demo build is public. Written to public/data/ (gitignored).
 */
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(HERE, 'cache', 'app-data.demo.json');
const dataDir = path.join(HERE, '..', 'public', 'data');
const dest = path.join(dataDir, 'app-data.json');
const PORT = Number(process.env.DTU_SERVER_PORT || 8787);

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
// Old photo out first: without --photo the demo has none.
for (const f of await readdir(dataDir)) if (f.startsWith('profile-photo.')) await rm(path.join(dataDir, f));
if (demo.profile) delete demo.profile.photo;

if (process.argv.includes('--photo')) {
  const res = await fetch(`http://127.0.0.1:${PORT}/api/profile/photo`).catch(() => null);
  const type = res?.headers.get('content-type') ?? '';
  if (!res?.ok || !type.startsWith('image/')) {
    console.error(res ? `No profile photo (HTTP ${res.status}): log in with the server running, and check you have a photo on DTU Learn.` : 'The local server is not running (npm run server).');
    process.exit(1);
  }
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  await writeFile(path.join(dataDir, `profile-photo.${ext}`), Buffer.from(await res.arrayBuffer()));
  demo.profile = { ...demo.profile, photo: `/data/profile-photo.${ext}` };
  console.log(`Profile photo exported to public/data/profile-photo.${ext}.`);
}

await writeFile(dest, JSON.stringify(demo, null, 2));
console.log(`Demo data exported to public/data/app-data.json (fetchedAt ${demo.fetchedAt}).`);
