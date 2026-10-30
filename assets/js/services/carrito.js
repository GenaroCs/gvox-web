import { buscarJuego, precioModalidad } from '../core/datos.js';
import { obtenerEstado, actualizar } from '../core/estado.js';
import { licenciaDe } from './biblioteca.js';
export function cotizar(item) {
  const juego = buscarJuego(item.juegoId);
  if (!juego) throw new Error('El juego no está disponible.');
  const precio = precioModalidad(juego, item.modalidad);
  const licencia = licenciaDe(item.juegoId);
  const descuento = item.modalidad === 'compra' && licencia?.vence ? Math.min(licencia.pagado, precio) : 0;
  const conversionVencida = Boolean(item.conversionId && (!licencia || licencia.id !== item.conversionId));
  return { ...item, juego, precio, descuento, total: precio - descuento, conversionDe: descuento ? licencia.id : null, conversionVencida };
}
export function agregar(juegoId, modalidad) {
  const licencia = licenciaDe(juegoId);
  if (licencia && !licencia.vence) throw new Error('Este juego ya está en tu biblioteca de forma permanente.');
  if (licencia?.vence && modalidad !== 'compra') throw new Error('Ya tienes un alquiler activo. Puedes convertirlo en compra.');
  cotizar({ juegoId, modalidad });
  actualizar(datos => {
    datos.carrito = datos.carrito.filter(item => item.juegoId !== juegoId);
    datos.carrito.push({ juegoId, modalidad, conversionId: modalidad === 'compra' && licencia?.vence ? licencia.id : null });
  });
}
export const quitar = juegoId => actualizar(datos => { datos.carrito = datos.carrito.filter(item => item.juegoId !== juegoId); });
export const vaciar = () => actualizar(datos => { datos.carrito = []; });
export const resumen = () => {
  const articulos = obtenerEstado().carrito.map(cotizar);
  return { articulos, subtotal: articulos.reduce((suma, item) => suma + item.precio, 0),
    descuento: articulos.reduce((suma, item) => suma + item.descuento, 0), total: articulos.reduce((suma, item) => suma + item.total, 0) };
};
export function alternarFavorito(juegoId) {
  if (!buscarJuego(juegoId)) return;
  actualizar(datos => { datos.favoritos = datos.favoritos.includes(juegoId) ? datos.favoritos.filter(id => id !== juegoId) : [...datos.favoritos, juegoId]; });
}
