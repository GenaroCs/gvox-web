import { demo, buscarJuego, precioModalidad } from './datos.js';
let clave = `gvox-demo-v1:${sesion()?.correo.toLowerCase() || 'invitado'}`;
const hora = 3600000;
function crearEstado() {
  const ahora = Date.now();
  return {
    version: 1, perfil: { nombre: 'NovaPlayer', biografia: 'Una aventura más, antes de apagar la pantalla.', avatar: 'avatar_kairo', privacidad: 'publico', mostrarActividad: true },
    saldo: 24000, carrito: [], favoritos: ['metaphor-refantazio', 'persona-5-royal'],
    biblioteca: [
      { id: 'lic-elden', juegoId: 'elden-ring', modalidad: 'compra', fecha: ahora - 24 * hora, vence: null, minutos: 35, pagado: precioModalidad(buscarJuego('elden-ring'), 'compra'), reembolsado: false },
      { id: 'lic-persona', juegoId: 'persona-3-reload', modalidad: 'compra', fecha: ahora - 20 * 24 * hora, vence: null, minutos: 245, pagado: precioModalidad(buscarJuego('persona-3-reload'), 'compra'), reembolsado: false },
      { id: 'lic-hades', juegoId: 'hades-ii', modalidad: 'alquiler_72h', fecha: ahora - 8 * hora, vence: ahora + 64 * hora, minutos: 20, pagado: precioModalidad(buscarJuego('hades-ii'), 'alquiler_72h'), reembolsado: false },
      { id: 'lic-hollow', juegoId: 'hollow-knight', modalidad: 'alquiler_48h', fecha: ahora - 72 * hora, vence: ahora - 24 * hora, minutos: 130, pagado: precioModalidad(buscarJuego('hollow-knight'), 'alquiler_48h'), reembolsado: false }
    ],
    colecciones: [{ id: 'col-favoritos', nombre: 'Mis próximas aventuras', juegos: ['elden-ring', 'hades-ii'] }],
    amigos: ['mika', 'ren', 'sora'], solicitudes: ['noa', 'lyra'], enviados: [], bloqueados: [],
    publicaciones: structuredClone(demo.publicaciones), resenas: structuredClone(demo.resenas),
    likes: [], movimientos: [{ id: 'mov-inicial', tipo: 'recarga', concepto: 'Saldo inicial de demostración', importe: 24000, fecha: ahora }], comprobantes: []
  };
}
let estado;
try {
  estado = JSON.parse(localStorage.getItem(clave));
  if (estado?.version !== 1 || !Array.isArray(estado.biblioteca)) estado = null;
} catch { estado = null; }
if (!estado) estado = crearEstado();
actualizarContenidoInicial(estado);
localStorage.setItem(clave, JSON.stringify(estado));
function actualizarContenidoInicial(datos) {
  for (const grupo of ['publicaciones', 'resenas']) {
    datos[grupo] = datos[grupo].map(item => demo[grupo].find(ejemplo => ejemplo.id === item.id) || item);
  }
}
export const obtenerEstado = () => structuredClone(estado);
export function actualizar(cambio) {
  const siguiente = structuredClone(estado);
  const resultado = cambio(siguiente);
  localStorage.setItem(clave, JSON.stringify(siguiente));
  estado = siguiente;
  window.dispatchEvent(new CustomEvent('gvox:cambio'));
  return resultado;
}
export function restablecer() {
  Object.keys(localStorage).filter(nombre => nombre.startsWith('gvox-demo-v1')).forEach(nombre => localStorage.removeItem(nombre));
  sessionStorage.removeItem('gvox-sesion');
  window.location.reload();
}
export function sesion() {
  try { return JSON.parse(sessionStorage.getItem('gvox-sesion')); } catch { return null; }
}
export function acceder(correo, nombre) {
  const invitado = !sesion();
  const carritoInvitado = invitado ? estado.carrito : [];
  const favoritosInvitado = invitado ? estado.favoritos : [];
  const normalizado = correo.trim().toLowerCase();
  sessionStorage.setItem('gvox-sesion', JSON.stringify({ correo: normalizado, nombre }));
  clave = `gvox-demo-v1:${normalizado}`;
  try { estado = JSON.parse(localStorage.getItem(clave)); } catch { estado = null; }
  if (estado?.version !== 1) estado = crearEstado();
  actualizarContenidoInicial(estado);
  actualizar(datos => {
    if (nombre) datos.perfil.nombre = nombre;
    for (const item of carritoInvitado) {
      datos.carrito = datos.carrito.filter(otro => otro.juegoId !== item.juegoId);
      datos.carrito.push(item);
    }
    datos.favoritos = [...new Set([...datos.favoritos, ...favoritosInvitado])];
  });
}
export function salir() {
  sessionStorage.removeItem('gvox-sesion');
  window.location.reload();
}
export const identificador = prefijo => `${prefijo}-${crypto.randomUUID()}`;
