// Publishes the demo build (dist/) to Netlify: `npm run publish`. See docs/pwa.md, "Published demo (Netlify)".
// The demo data must already be fresh (`npm run demo-data`, which refuses non-anonymized classlists).
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dist = path.join(__dirname, '..', 'dist');
// Never publish these, even if they ended up in public/ by mistake (see CLAUDE.md, Privacy)
for (const p of ['files', 'data/app-data.real.json']) {
  const target = path.join(dist, p);
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`removed dist/${p} (never published)`);
  }
}
const data = JSON.parse(fs.readFileSync(path.join(dist, 'data', 'app-data.json'), 'utf8'));
console.log(`publishing demo data, ${data.agenda?.length ?? 0} agenda items`);
execSync('npx --yes netlify-cli deploy --prod --dir dist', { stdio: 'inherit' });
