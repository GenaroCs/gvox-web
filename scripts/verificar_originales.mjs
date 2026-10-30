import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const copies = JSON.parse((await readFile(join(root, 'docs/registros/copias-originales.json'), 'utf8')).replace(/^\uFEFF/, ''));
let added = [];
try { added = JSON.parse(await readFile(join(root, 'docs/registros/originales-descargados.json'), 'utf8')); }
catch (e) { if (e.code !== 'ENOENT') throw e; }
const digest = async p => createHash('sha256').update(await readFile(p)).digest('hex');
async function files(dir) {
  const list = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, item.name);
    if (item.isDirectory()) list.push(...await files(full));
    else list.push(full);
  }
  return list;
}
const results = [];
for (const pack of copies) {
  const differences = [];
  for (const entry of pack.files) {
    for (const base of [pack.source, pack.destination]) {
      try { if ((await digest(join(base, entry.relativePath))).toUpperCase() !== entry.sha256) differences.push(join(base, entry.relativePath)); }
      catch { differences.push(join(base, entry.relativePath)); }
    }
  }
  for (const base of [pack.source, pack.destination]) {
    const expected = new Set(pack.files.map(x => x.relativePath.replaceAll('\\', '/')));
    if (base === pack.destination) {
      for (const entry of added) {
        const full = resolve(root, '..', '00_MATERIAL_ORIGINAL', entry.ruta);
        const rel = relative(base, full);
        if (!rel.startsWith('..')) {
          expected.add(rel.replaceAll('\\', '/'));
          try { if (await digest(full) !== entry.sha256) differences.push(full); }
          catch { differences.push(full); }
        }
      }
    }
    for (const full of await files(base)) if (!expected.has(relative(base, full).replaceAll('\\', '/'))) differences.push(full);
  }
  results.push({ origen: pack.source, copia: pack.destination, archivos: pack.files.length, intactos: differences.length === 0, diferencias: differences });
}
await writeFile(join(root, 'docs/registros/verificacion-originales.json'), JSON.stringify(results, null, 2) + '\n');
console.log(`${results.reduce((n, p) => n + p.archivos, 0)} archivos comparados en escritorio y material original. Integridad: ${results.every(p => p.intactos) ? 'CORRECTA' : 'REVISAR'}.`);
console.log(`${added.length} originales descargados adicionales contrastados con su inventario SHA-256.`);
if (results.some(p => !p.intactos)) process.exitCode = 1;
