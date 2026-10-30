// Gvox / Paquete 03. Descarga por primera vez materiales promocionales de terceros.
// Node.js 18+. Ejecuta desde una terminal: node descargar_catalogo.mjs
// No requiere paquetes externos; no modifica el Paquete 01/02.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz=dirname(fileURLToPath(import.meta.url));
const juegos=JSON.parse(await readFile(join(raiz,'juegos.json'),'utf8'));
const dominios=[
  'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{id}/{nombre}',
  'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{id}/{nombre}',
  'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/{id}/{nombre}',
  'https://cdn.cloudflare.steamstatic.com/steam/apps/{id}/{nombre}',
  'https://cdn.akamai.steamstatic.com/steam/apps/{id}/{nombre}',
];
const nombres={ portada_vertical:'library_600x900.jpg',cabecera:'header.jpg',tarjeta_horizontal:'capsule_616x353.jpg'};
const resultados=[];
async function descargar(url){
  const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),14000);
  try {
    const res=await fetch(url,{signal:ctrl.signal,headers:{'Accept':'image/jpeg,image/*;q=0.8'}});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const bytes=Buffer.from(await res.arrayBuffer());
    if(bytes.length<4500 || bytes[0]!==0xff || bytes[1]!==0xd8 || bytes[2]!==0xff)
      throw new Error('La respuesta no es un JPG valido ('+bytes.length+' bytes)');
    return bytes;
  } finally {clearTimeout(timer)}
}
async function descargarConOpciones(id,nombre){
  let error='';
  for(const plantilla of dominios){
    const url=plantilla.replace('{id}',String(id)).replace('{nombre}',nombre);
    try {return {bytes:await descargar(url),url};}
    catch(e){error=e.message;}
  }
  throw new Error(error||'No hay servidor disponible');
}
let num=0;
for(const juego of juegos){
  for(const [tipo,archivo] of Object.entries(nombres)){
    num++;
    process.stdout.write(`[${num}/60] ${juego.nombre} / ${tipo}: `);
    const dest=join(raiz,juego.imagenes[tipo]);
    try {
      const {bytes,url}=await descargarConOpciones(juego.id,archivo);
      await mkdir(dirname(dest),{recursive:true});await writeFile(dest,bytes);
      resultados.push({juego:juego.nombre,tipo,estado:'OK',archivo:juego.imagenes[tipo],url,bytes:bytes.length});
      console.log('OK ('+Math.round(bytes.length/1024)+' KB)');
    } catch(e){resultados.push({juego:juego.nombre,tipo,estado:'ERROR',archivo:juego.imagenes[tipo],detalle:e.message});console.log('NO DISPONIBLE');}
  }
}
// Crea el registro y un manifiesto utilizable con las imágenes realmente descargadas.
const nuevo=juegos.map(j=>{
  const imagenes={};
  for(const [tipo,archivo] of Object.entries(j.imagenes)) {
    const estado=resultados.find(r=>r.juego===j.nombre && r.tipo===tipo);
    imagenes[tipo]=estado?.estado==='OK'?archivo:null;
  }
  return {...j,imagenes};
});
await writeFile(join(raiz,'estado_descarga.json'),JSON.stringify(resultados,null,2),'utf8');
await writeFile(join(raiz,'juegos_descargados.json'),JSON.stringify(nuevo,null,2),'utf8');
const ok=resultados.filter(r=>r.estado==='OK').length;
console.log(`\nLISTO: ${ok}/60 archivos descargados. Revisa estado_descarga.json y juegos_descargados.json.`);
if(ok<60) console.log('Las imagenes ausentes pueden ser reemplazadas manualmente usando fuentes_catalogo.csv; no uses otra portada sin comprobar el juego.');
if(!ok) process.exitCode=1;
