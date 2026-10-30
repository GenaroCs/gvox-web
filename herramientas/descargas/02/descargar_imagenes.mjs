// Descargador de recursos promocionales OFICIALES para Gvox.
// Ejecutar en Windows o macOS/Linux con: node descargar_imagenes.mjs
// Necesita Node.js 18+ e Internet. No instala dependencias ni modifica otros archivos.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8'));
const results=[];
async function descargar(url) {
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),20000);
  try {
    const response=await fetch(url,{signal:controller.signal,headers:{'User-Agent':'Mozilla/5.0 (compatible; GvoxAcademicDemo/1.0)','Accept':'image/jpeg,image/png;q=0.8,*/*;q=0.1'}});
    if(!response.ok) throw new Error('HTTP '+response.status);
    const type=response.headers.get('content-type')||'';
    const buf=Buffer.from(await response.arrayBuffer());
    // Distingue una imagen JPEG de una respuesta de error HTML/JSON.
    if(buf.length < 5000 || buf[0]!==0xff || buf[1]!==0xd8 || buf[2]!==0xff)
      throw new Error('No llegó una imagen JPEG válida ('+type+', '+buf.length+' bytes)');
    return buf;
  } finally {clearTimeout(timeout)}
}
for(let i=0;i<data.recursos.length;i++){
 const item=data.recursos[i];let saved=false;let last='';
 console.log(`[${i+1}/${data.recursos.length}] ${item.juego}: ${item.uso}`);
 for(const url of item.alternativas_de_descarga){
  try{
   const buf=await descargar(url);
   const dest=join(root,item.archivo);
   await mkdir(dirname(dest),{recursive:true});
   await writeFile(dest,buf);
   console.log('  OK: '+item.archivo+' ('+Math.round(buf.length/1024)+' KB)');
   results.push({id:item.id,estado:'OK',archivo:item.archivo,origen:url,bytes:buf.length});
   saved=true;break;
  }catch(e){last=e.message;}
 }
 if(!saved){console.log('  NO DESCARGADO: '+last);results.push({id:item.id,estado:'ERROR',detalle:last});}
}
await writeFile(join(root,'estado-descarga.json'),JSON.stringify(results,null,2),'utf8');
const n=results.filter(x=>x.estado==='OK').length;
console.log(`\nDescargadas ${n} de ${data.recursos.length} imágenes. Revisa estado-descarga.json.`);
if(n!==data.recursos.length)process.exitCode=1;
