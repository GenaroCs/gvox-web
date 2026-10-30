// Herramienta de preparación: ejecuta las cuatro copias revisadas, sin dependencias.
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jobs = [
  ['02', 'descargar_imagenes.mjs'], ['03', 'descargar_catalogo.mjs'],
  ['04', 'descargar_galerias.mjs'], ['05', 'descargar_comunidad.mjs'],
];
await Promise.all(jobs.map(([id, script]) => new Promise((done, reject) => {
  const log = createWriteStream(resolve(root, `docs/registros/descarga-${id}.log`));
  const child = spawn(process.execPath, [resolve(root, `herramientas/descargas/${id}/${script}`)], { windowsHide: true });
  child.stdout.pipe(log, { end: false });
  child.stderr.pipe(log, { end: false });
  child.on('error', reject);
  child.on('close', code => { log.end(); console.log(`Paquete ${id}: ejecución terminada, código ${code}. Revisar registro individual.`); done(); });
})));
