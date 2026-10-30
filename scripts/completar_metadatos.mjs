// Preparación de JSON local: no descarga imágenes ni introduce llamadas externas en la aplicación.
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const juegos = JSON.parse(await readFile(resolve(root, 'data/juegos.json'), 'utf8'));
const salida = {};
for (const juego of juegos) {
  const url = `https://store.steampowered.com/api/appdetails?appids=${juego.steam_appid}&l=spanish&cc=pe`;
  const respuesta = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!respuesta.ok) throw Error(`HTTP ${respuesta.status}: ${juego.id}`);
  const payload = await respuesta.json();
  const datos = payload[String(juego.steam_appid)]?.data;
  if (!datos || datos.steam_appid !== juego.steam_appid) throw Error(`Identificador inconsistente: ${juego.id}`);
  salida[juego.id] = { descripcion: datos.detailed_description || datos.short_description,
    requisitos: datos.pc_requirements, categorias: datos.categories || [], videos_en_fuente: (datos.movies || []).length,
    fuente: url };
  console.log(`Información local: ${juego.nombre}`);
}
await writeFile(resolve(root, 'docs/fuentes/metadatos-steam.json'), JSON.stringify(salida, null, 2));
