// GVOX 05: utiliza solamente material promocional de Steam.
// Node.js 18 o superior. Sin dependencias. No se generan imágenes.
// Ejecutar: node descargar_comunidad.mjs
// Modo sin conexión: node descargar_comunidad.mjs --plan
import {readFile,mkdir,writeFile,stat} from 'node:fs/promises';
import {join,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=dirname(fileURLToPath(import.meta.url));
const items=JSON.parse(await readFile(join(ROOT,'manifest_comunidad.json'),'utf8'));
const args=process.argv.slice(2),plan=args.includes('--plan');
const only=args.find(x=>x.startsWith('--solo='))?.slice(7);
const tasks=only?items.filter(x=>x.grupo===only||x.id===only):items;
const reports=[];const outputs={};
const nap=ms=>new Promise(r=>setTimeout(r,ms));
const allowed=u=>{try{let x=new URL(u);return x.protocol==='https:'&&/(^|\.)(steamstatic\.com|steamusercontent\.com)$/.test(x.hostname)}catch{return false}};
async function request(url,json=false,attempts=3){let err;
 for(let i=0;i<attempts;i++){
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),22000);
  try{const r=await fetch(url,{signal:ac.signal,headers:{'User-Agent':'GVOX-Prototipo-Academico/1.0'}});if(!r.ok)throw Error('HTTP '+r.status);
    if(json)return await r.json();
    if(!allowed(url))throw Error('Dominio de imagen no permitido');
    const type=(r.headers.get('content-type')||'').toLowerCase().split(';')[0];
    if(!['image/jpeg','image/png','image/webp'].includes(type))throw Error('No es imagen válida: '+type);
    const data=Buffer.from(await r.arrayBuffer());if(data.length<2500||data.length>15000000)throw Error('Tamaño no permitido');
    const signature=type==='image/jpeg'?data[0]===0xff&&data[1]===0xd8:type==='image/png'?data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):data.toString('ascii',0,4)==='RIFF'&&data.toString('ascii',8,12)==='WEBP';
    if(!signature)throw Error('Firma de archivo incorrecta');return {data,type};
  }catch(e){err=e;if(i<attempts-1)await nap(450*(i+1));}finally{clearTimeout(tm)}}throw err;
}
let completed=0;
for(const asset of tasks){
 const filename=join(ROOT,asset.destino),metaUrl=`https://store.steampowered.com/api/appdetails?appids=${asset.steam_appid}&l=spanish`;
 if(plan){console.log(`[PLAN] ${asset.id} -> ${asset.destino}`);continue;}
 try{
  try{const s=await stat(filename);if(s.size>2500){reports.push({id:asset.id,status:'EXISTENTE',path:asset.destino});completed++;continue}}catch{}
  let data=outputs[asset.steam_appid];if(!data){let resp=await request(metaUrl,true);let obj=resp[String(asset.steam_appid)];if(!obj?.success||!obj.data)throw Error('Steam no devolvió datos');outputs[asset.steam_appid]=data=obj.data;}
  // Use exact URLs returned by the source, not made-up screenshot hashes.
  const urls=asset.tipo==='captura'?[(data.screenshots||[])[asset.indice_captura]?.path_full]:asset.tipo==='fondo'?[data.background_raw,data.background,data.header_image]:asset.tipo==='capsula'?[data.capsule_imagev5,data.capsule_image,data.header_image]:[data.header_image,data.capsule_image];
  let src,bytes,type,last;
  for(const candidate of urls.filter(Boolean)){
   if(!allowed(candidate))continue;
   try{const got=await request(candidate);src=candidate;bytes=got.data;type=got.type;break;}catch(e){last=e}
  }
  if(!bytes)throw last||Error('Ninguna imagen disponible para este recurso');
  const ext=type==='image/png'?'.png':type==='image/webp'?'.webp':'.jpg';
  const finalFile=filename.replace(/\.jpg$/,ext);const destRel=asset.destino.replace(/\.jpg$/,ext);
  await mkdir(dirname(finalFile),{recursive:true});await writeFile(finalFile,bytes);
  reports.push({id:asset.id,status:'OK',path:destRel,fuente:src,bytes:bytes.length});completed++;
  console.log(`[OK] ${asset.id} -> ${destRel}`)
 }catch(e){reports.push({id:asset.id,status:'ERROR',motivo:e.message});console.error(`[ERROR] ${asset.id}: ${e.message}`)}
 await writeFile(join(ROOT,'estado_descarga.json'),JSON.stringify(reports,null,2),'utf8');
 await nap(250);
}
if(plan){console.log(`Plan de ${tasks.length} recursos, sin descargar.`)}
else{await writeFile(join(ROOT,'estado_descarga.json'),JSON.stringify(reports,null,2),'utf8');console.log(`\nListo: ${completed} / ${tasks.length} imágenes disponibles. Ver estado_descarga.json`)}
