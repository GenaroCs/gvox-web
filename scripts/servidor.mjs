import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const servidor = http.createServer(async (peticion, respuesta) => {
  try {
    const pathname = decodeURIComponent(new URL(peticion.url, 'http://localhost').pathname);
    let archivo = resolve(root, `.${pathname}`);
    if (archivo !== root && !archivo.startsWith(root + sep)) { respuesta.writeHead(403).end(); return; }
    if ((await stat(archivo)).isDirectory()) archivo = resolve(archivo, 'index.html');
    const extension = extname(archivo);
    if (!tipos[extension]) { respuesta.writeHead(404).end('Recurso no disponible.'); return; }
    const contenido = await readFile(archivo);
    respuesta.writeHead(200, { 'Content-Type': tipos[extension], 'Content-Length': contenido.length,
      'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'self'; frame-ancestors 'none'" });
    respuesta.end(peticion.method === 'HEAD' ? undefined : contenido);
  } catch { respuesta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontramos esta página.'); }
});
servidor.listen(port, '127.0.0.1', () => console.log(`Gvox · http://127.0.0.1:${port}`));
servidor.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `El puerto ${port} está ocupado. Elige otro con la variable PORT.` : error.message); process.exitCode = 1; });
