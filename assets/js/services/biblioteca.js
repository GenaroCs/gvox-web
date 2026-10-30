import { obtenerEstado, actualizar, identificador } from '../core/estado.js';
export const vigente = licencia => !licencia.reembolsado && (!licencia.vence || licencia.vence > Date.now());
export const licenciaDe = juegoId => obtenerEstado().biblioteca.find(licencia => licencia.juegoId === juegoId && vigente(licencia));
export function tiempoRestante(vence) {
  const segundos = Math.max(0, Math.floor((vence - Date.now()) / 1000));
  return `${Math.floor(segundos / 3600)}h ${String(Math.floor(segundos % 3600 / 60)).padStart(2, '0')}m ${String(segundos % 60).padStart(2, '0')}s`;
}
export function puedeReembolsar(licencia) {
  return !licencia.reembolsado && Date.now() >= licencia.fecha && Date.now() - licencia.fecha < 14 * 86400000 && licencia.minutos < 120;
}
export function reembolsar(id) {
  return actualizar(datos => {
    const licencia = datos.biblioteca.find(item => item.id === id);
    if (!licencia || !puedeReembolsar(licencia)) throw new Error('El reembolso requiere una licencia no reembolsada, menos de 14 días y menos de 2 horas de uso.');
    licencia.reembolsado = true;
    datos.saldo += licencia.pagado;
    datos.movimientos.unshift({ id: identificador('mov'), tipo: 'reembolso', concepto: `Reembolso · ${licencia.juegoId}`, importe: licencia.pagado, fecha: Date.now() });
    datos.colecciones.forEach(coleccion => { coleccion.juegos = coleccion.juegos.filter(juegoId => juegoId !== licencia.juegoId); });
  });
}
export function jugar(id) {
  return actualizar(datos => {
    const licencia = datos.biblioteca.find(item => item.id === id);
    if (!licencia || !vigente(licencia)) throw new Error('La licencia de demostración ha vencido o fue reembolsada.');
    licencia.minutos += 15;
  });
}
export function crearColeccion(nombre) {
  const limpio = nombre.trim();
  if (!limpio || limpio.length > 40) throw new Error('Escribe un nombre de entre 1 y 40 caracteres.');
  actualizar(datos => {
    if (datos.colecciones.some(coleccion => coleccion.nombre.toLowerCase() === limpio.toLowerCase())) throw new Error('Ya existe una colección con ese nombre.');
    datos.colecciones.push({ id: identificador('col'), nombre: limpio, juegos: [] });
  });
}
export function asignarColeccion(coleccionId, juegoId) {
  if (!licenciaDe(juegoId)) throw new Error('Solo puedes organizar juegos con licencia vigente.');
  actualizar(datos => {
    const coleccion = datos.colecciones.find(item => item.id === coleccionId);
    if (!coleccion) throw new Error('Selecciona una colección.');
    coleccion.juegos = coleccion.juegos.includes(juegoId) ? coleccion.juegos.filter(id => id !== juegoId) : [...coleccion.juegos, juegoId];
  });
}
export const eliminarColeccion = id => actualizar(datos => { datos.colecciones = datos.colecciones.filter(item => item.id !== id); });
export function renombrarColeccion(id, nombre) {
  const limpio = nombre.trim();
  if (!limpio || limpio.length > 40) throw new Error('Escribe un nombre de entre 1 y 40 caracteres.');
  actualizar(datos => {
    if (datos.colecciones.some(item => item.id !== id && item.nombre.toLowerCase() === limpio.toLowerCase())) throw new Error('Ya existe una colección con ese nombre.');
    const coleccion = datos.colecciones.find(item => item.id === id);
    if (!coleccion) throw new Error('La colección no existe.');
    coleccion.nombre = limpio;
  });
}
