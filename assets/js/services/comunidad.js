import { actualizar, identificador, obtenerEstado, sesion } from '../core/estado.js';
import { buscarJuego } from '../core/datos.js';
import { licenciaDe } from './biblioteca.js';
export function gestionarAmigo(id, accion) {
  actualizar(datos => {
    if (accion === 'aceptar') {
      if (!datos.solicitudes.includes(id)) throw new Error('La solicitud ya no está disponible.');
      if (!datos.amigos.includes(id)) datos.amigos.push(id);
      datos.solicitudes = datos.solicitudes.filter(valor => valor !== id);
    } else if (accion === 'solicitar') {
      if (!datos.amigos.includes(id) && !datos.enviados.includes(id) && !datos.bloqueados.includes(id)) datos.enviados.push(id);
    } else if (accion === 'rechazar') datos.solicitudes = datos.solicitudes.filter(valor => valor !== id);
    else if (accion === 'bloquear') {
      if (!datos.bloqueados.includes(id)) datos.bloqueados.push(id);
      for (const grupo of ['amigos', 'solicitudes', 'enviados']) datos[grupo] = datos[grupo].filter(valor => valor !== id);
    } else if (accion === 'desbloquear') datos.bloqueados = datos.bloqueados.filter(valor => valor !== id);
  });
}
export function publicarResena(juegoId, recomienda, texto) {
  if (!sesion()) throw new Error('Accede para publicar una reseña de demostración.');
  if (!licenciaDe(juegoId)) throw new Error('Necesitas una licencia vigente en tu biblioteca para reseñar este juego.');
  if (typeof recomienda !== 'boolean' || texto.trim().length < 10 || texto.trim().length > 1500) throw new Error('Indica si recomiendas el juego y escribe entre 10 y 1 500 caracteres.');
  actualizar(datos => {
    datos.resenas = datos.resenas.filter(item => !(item.usuarioId === 'yo' && item.juegoId === juegoId));
    datos.resenas.unshift({ id: identificador('resena'), usuarioId: 'yo', juegoId, recomienda, texto: texto.trim(), verificada: true, fecha: Date.now() });
  });
}
export function publicar(juegoId, texto) {
  if (!sesion()) throw new Error('Accede para publicar en la comunidad de demostración.');
  if (!buscarJuego(juegoId) || texto.trim().length < 5 || texto.trim().length > 1000) throw new Error('Selecciona un juego y escribe entre 5 y 1 000 caracteres.');
  actualizar(datos => { datos.publicaciones.unshift({ id: identificador('post'), usuarioId: 'yo', juegoId, texto: texto.trim(), fecha: Date.now() }); });
}
export const alternarLike = id => actualizar(datos => { datos.likes = datos.likes.includes(id) ? datos.likes.filter(valor => valor !== id) : [...datos.likes, id]; });
export function guardarPerfil({ nombre, biografia, privacidad, mostrarActividad }) {
  if (!nombre.trim() || nombre.trim().length > 30 || biografia.length > 200) throw new Error('El nombre debe tener entre 1 y 30 caracteres y la biografía hasta 200.');
  if (!['publico', 'amigos', 'privado'].includes(privacidad)) throw new Error('Selecciona un nivel de privacidad válido.');
  actualizar(datos => { Object.assign(datos.perfil, { nombre: nombre.trim(), biografia: biografia.trim(), privacidad, mostrarActividad }); });
}
