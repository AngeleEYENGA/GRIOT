import { readdir, writeFile } from 'node:fs/promises';
const files = await readdir(new URL('../dist/assets/', import.meta.url));
const assets = files.filter((file) => /\.(js|css)$/.test(file)).map((file) => `/assets/${file}`);
await writeFile(new URL('../dist/offline-assets.json', import.meta.url), JSON.stringify(assets));
console.log(`Offline shell: ${assets.length} application resources.`);
