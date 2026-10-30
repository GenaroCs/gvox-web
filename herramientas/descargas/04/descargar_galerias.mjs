// GVOX 04: descargar exclusivamente capturas y banners reales publicados en Steam.
// Node.js 18+, sin dependencias externas.
// Uso: node descargar_galerias.mjs
// Prueba sin red: node descargar_galerias.mjs --plan
// Un solo juego: node descargar_galerias.mjs --solo=persona-3-reload
import { readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const RAIZ=dirname(fileURLToPath(import.meta.url));
const juegos=JSON.parse(await readFile(join(RAIZ,'galerias_plan.json'),'utf8'));
const args=process.argv.slice(2);
const plan=args.includes('--plan');
const solo=args.find(s=>s.startsWith('--solo='))?.slice('--solo='.length);
const selected=solo?juegos.filter(j=>j.slug===solo):juegos;
if(!selected.length) { console.error('Juego no encontrado. Revisa galerias_plan.json');process.exitCode=1; }
const pausa=(ms)=>new Promise(ok=>setTimeout(ok,ms));
const reporte=[];
const disponibles=[];
const extByType={ 'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/avif':'.avif'};
function steamUrl(url){
 try {
   const u=new URL(url);
   return u.protocol==='https:' && /(^|\.)(steamstatic\.com|steamusercontent\.com)$/.test(u.hostname);
 } catch {return false;}
}
async function recibir(url, image=false, intentos=3){
 if(!steamUrl(url) && image) throw new Error('Origen de imagen no permitido');
 let ultima;
 for(let a=0;a<intentos;a++) {
   const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),25000);
   try {
     const r=await fetch(url,{signal:ctrl.signal,headers:{'Accept':image?'image/avif,image/webp,image/jpeg,image/png,image/*;q=0.7':'application/json,*/*;q=0.8','User-Agent':'GVOX-Estudio-Academico/1.0'}});
     if(!r.ok)throw new Error(`HTTP ${r.status}`);
     if(!image) return await r.json();
     const declaredMime=(r.headers.get('content-type')||'').toLowerCase().split(';')[0];
     if(!extByType[declaredMime])throw new Error('No es imagen admitida: '+declaredMime);
     const declared=Number(r.headers.get('content-length')||'0');
     if(declared>16000000)throw new Error('Archivo demasiado grande');
     const bytes=Buffer.from(await r.arrayBuffer());
     if(bytes.length<3500||bytes.length>16000000)throw new Error('Imagen demasiado pequena/grande');
     // Algunos fondos PNG se anuncian como JPEG. La extensión sigue los bytes reales.
     // Ajuste exclusivo de esta copia de trabajo; el original permanece intacto.
     const mime=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':
       bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':
       bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'?'image/webp':
       bytes.toString('ascii',4,8)==='ftyp'&&['avif','avis'].includes(bytes.toString('ascii',8,12))?'image/avif':null;
     if(!mime)throw new Error('Firma binaria no admitida');
     return {bytes,mime};
   } catch(e) {ultima=e; if(a<intentos-1)await pausa(750+1200*a);} finally {clearTimeout(timer);}
 }
 throw ultima;
}
function preferredScreenshot(s){
 const original=String(s?.path_full||'');
 // El API proporciona la URL auténtica, sin intentar adivinar el hash del archivo.
 if(!steamUrl(original))return null;
 return original;
}
async function guardar(url,stem,juego,tipo){
 const base=join(RAIZ,'imagenes','galerias',juego.slug,stem);
 for(const extension of Object.values(extByType)) {
   try {if((await stat(base+extension)).size>3500)return {archivo:`imagenes/galerias/${juego.slug}/${stem}${extension}`,url,bytes:0,reutilizado:true};} catch{}
 }
 const {bytes,mime}=await recibir(url,true);
 const rel=`imagenes/galerias/${juego.slug}/${stem}${extByType[mime]}`;
 await mkdir(dirname(join(RAIZ,rel)),{recursive:true});
 await writeFile(join(RAIZ,rel),bytes);
 return {archivo:rel,url,bytes:bytes.length,reutilizado:false};
}
const outputPath=join(RAIZ,'galerias_descargadas.json');
const logPath=join(RAIZ,'estado_descarga.json');
try {
 for(let [i,j] of selected.entries()){
  const entry={steam_appid:j.steam_appid,slug:j.slug,nombre:j.nombre,portada_del_paquete_03:`../GVOX_03_CATALOGO/imagenes/catalogo/${j.slug}/portada_vertical.jpg`,capturas:[],banner:null,datos:{}};
  if(plan){
   entry.capturas=j.capturas_previstas.map((ruta,k)=>({posicion:k+1,destino_previsto:ruta}));
   entry.banner=j.banner_previsto;
   disponibles.push(entry);
   console.log(`[${i+1}/${selected.length}] ${j.nombre}: ${j.cantidad_capturas_previstas} capturas${j.destacado?' + banner':''}`);
   continue;
  }
  console.log(`\n[${i+1}/${selected.length}] ${j.nombre}`);
  let info;
  try {
   const payload=await recibir(j.url_api_metadatos,false,3);
   const obj=payload[String(j.steam_appid)];
   if(!obj?.success||!obj.data||obj.data.steam_appid!==j.steam_appid)throw new Error('Metadata no disponible o ID distinto');
   info=obj.data;
   entry.datos={nombre_oficial:info.name,descripcion:info.short_description||'',estreno:info.release_date?.date||'',generos:(info.genres||[]).map(x=>x.description),desarrolladores:info.developers||[],editores:info.publishers||[],requisitos_pc:info.pc_requirements?.minimum||''};
  } catch(e){
   console.error('  Falló metadata: '+e.message);
   reporte.push({juego:j.nombre,tipo:'metadata',estado:'ERROR',detalle:e.message});
   disponibles.push(entry);
   await pausa(1000);
   continue;
  }
  const screens=(info.screenshots||[]).map(preferredScreenshot).filter(Boolean);
  if(!screens.length){reporte.push({juego:j.nombre,tipo:'capturas',estado:'ERROR',detalle:'La ficha no lista capturas'});}
  for (let k=0;k<j.cantidad_capturas_previstas;k++){
   const src=screens[k];
   if(!src){reporte.push({juego:j.nombre,tipo:'captura',numero:k+1,estado:'AUSENTE',detalle:'No hay captura con esa posición'});continue;}
   try {
     const file=await guardar(src,`captura_${String(k+1).padStart(2,'0')}`,j,'captura');
     entry.capturas.push({...file,numero:k+1});
     reporte.push({juego:j.nombre,tipo:'captura',numero:k+1,estado:'OK',...file});
     console.log(`  captura ${k+1}: OK`);
   }catch(e){reporte.push({juego:j.nombre,tipo:'captura',numero:k+1,estado:'ERROR',url:src,detalle:e.message});console.log(`  captura ${k+1}: ERROR`);}
  }
  if(j.destacado){
   const banner=info.background_raw||info.background;
   if(banner&&steamUrl(banner)) {
     try {entry.banner=await guardar(banner,'banner',j,'banner');reporte.push({juego:j.nombre,tipo:'banner',estado:'OK',...entry.banner});console.log('  banner: OK');}
     catch(e){reporte.push({juego:j.nombre,tipo:'banner',estado:'ERROR',url:banner,detalle:e.message});console.log('  banner: ERROR');}
   }else{reporte.push({juego:j.nombre,tipo:'banner',estado:'AUSENTE',detalle:'No hay fondo oficial en la metadata'});}
  }
  disponibles.push(entry);
  // Guardado incremental por si Steam limita la velocidad o interrumpe las descargas.
  await writeFile(outputPath,JSON.stringify(disponibles,null,2),'utf8');
  await writeFile(logPath,JSON.stringify(reporte,null,2),'utf8');
  await pausa(650);
 }
}finally {
 if(!plan){
   await writeFile(outputPath,JSON.stringify(disponibles,null,2),'utf8');
   await writeFile(logPath,JSON.stringify(reporte,null,2),'utf8');
 }
}
const ok=reporte.filter(r=>r.estado==='OK').length;
console.log(plan?'\nPlan validado (sin conexiones ni imágenes nuevas).':`\nFinalizado: ${ok} imágenes obtenidas. Consulta estado_descarga.json.`);
console.log(`Se revisaron ${disponibles.length}/${selected.length} títulos.`);
