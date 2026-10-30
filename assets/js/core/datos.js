const base = new URL('../../../', import.meta.url);
export const ruta = (archivo = '') => new URL(archivo, base).href;
const leer = async nombre => {
  const respuesta = await fetch(ruta(`data/${nombre}.json`));
  if (!respuesta.ok) throw new Error(`No se pudo cargar ${nombre}.`);
  return respuesta.json();
};
export const [juegos, galerias, detalles, imagenes, demo] = await Promise.all(
  ['juegos', 'galerias', 'juegos-detalles', 'imagenes', 'demo'].map(leer)
);
export const buscarJuego = id => juegos.find(juego => juego.id === id);
export const galeriaDe = id => galerias.find(galeria => galeria.juego_id === id);
export const detalleDe = id => detalles[id];
export const ficha = id => ruta(`pages/ficha.html?juego=${encodeURIComponent(id)}`);
export const soles = centavos => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(centavos / 100);
export const fecha = valor => new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeZone: 'America/Lima' }).format(new Date(valor));
export const fechaHora = valor => new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Lima' }).format(new Date(valor));
export const escapar = valor => String(valor ?? '').replace(/[&<>"']/g, caracter => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caracter]));
export const modalidades = { compra: 'Compra permanente', alquiler_48h: 'Alquiler · 48 horas', alquiler_72h: 'Alquiler · 72 horas' };
export function precioCompra(juego) {
  return Math.round(juego.precio_demo_soles * 100 * (1 - (detalleDe(juego.id).oferta || 0) / 100));
}
export function precioModalidad(juego, modalidad) {
  if (modalidad === 'compra') return precioCompra(juego);
  if (modalidad === 'alquiler_48h') return Math.round(juego.alquiler_48h_demo_soles * 100);
  if (modalidad === 'alquiler_72h') return Math.round(juego.alquiler_72h_demo_soles * 100);
  throw new Error('Selecciona una modalidad válida.');
}
