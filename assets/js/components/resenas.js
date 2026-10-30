import { demo, buscarJuego, escapar, ficha, juegos } from '../core/datos.js';
import { obtenerEstado, sesion } from '../core/estado.js';
import { licenciaDe } from '../services/biblioteca.js';
import { publicarResena } from '../services/comunidad.js';
import { personaActual } from './estructura.js';
import { avatar, vacio } from './fabrica.js';
import { formularioDialogo, aviso } from './dialogos.js';
import { icono } from './iconos.js';
export function listaResenas(juegoId) {
  const estado = obtenerEstado();
  const resenas = estado.resenas.filter(item => (!juegoId || item.juegoId === juegoId) && !estado.bloqueados.includes(item.usuarioId));
  return resenas.length ? resenas.map(item => {
    const usuario = item.usuarioId === 'yo' ? personaActual() : demo.usuarios.find(persona => persona.id === item.usuarioId);
    const verificada = item.usuarioId === 'yo' ? !!licenciaDe(item.juegoId) : usuario?.licencias.includes(item.juegoId);
    return `<article class="resena"><div class="resena-cabecera">${avatar(usuario)}<div><strong>${escapar(usuario.nombre)}</strong><small>${item.usuarioId === 'yo' ? 'Tu reseña' : 'Miembro de la comunidad'}</small></div><span class="recomendacion ${item.recomienda === false ? 'calido' : 'lima'}">${item.recomienda === false ? '↓ NO LO RECOMIENDA' : '↑ LO RECOMIENDA'}</span></div>${!juegoId ? `<a class="enlace-lima" href="${ficha(item.juegoId)}">${escapar(buscarJuego(item.juegoId).nombre)} ↗</a>` : ''}<p>${escapar(item.texto)}</p><span class="insignia">${icono('escudo')} ${verificada ? 'Licencia verificada' : 'Licencia ya no vigente'}</span></article>`;
  }).join('') : vacio('La primera opinión puede ser la tuya.', 'Las reseñas requieren una licencia vigente de demostración.', null);
}
export function escribirResena(juegoId) {
  if (!sesion()) { aviso('Accede para escribir una reseña de demostración.', true); return; }
  const propios = juegos.filter(juego => licenciaDe(juego.id));
  if (!propios.length || juegoId && !licenciaDe(juegoId)) { aviso('Necesitas una licencia vigente de este juego para escribir una reseña.', true); return; }
  const campos = `${!juegoId ? `<label class="campo">JUEGO<select name="juegoId" required>${propios.map(juego => `<option value="${juego.id}">${escapar(juego.nombre)}</option>`).join('')}</select></label>` : ''}<label class="campo">¿LO RECOMIENDAS?<select name="recomienda"><option value="si">↑ Sí, lo recomiendo</option><option value="no">↓ No lo recomiendo</option></select></label><label class="campo">TU EXPERIENCIA<textarea name="texto" required minlength="10" maxlength="1500" placeholder="¿Qué te gustó y qué mejorarías?"></textarea></label><p class="pequeno muted">Solo puedes reseñar juegos con licencia vigente en la cuenta local. Tu reseña será visible en esta demo.</p>`;
  formularioDialogo('Tu experiencia cuenta', campos, datos => { publicarResena(juegoId || datos.get('juegoId'), datos.get('recomienda') === 'si', datos.get('texto')); aviso('Reseña publicada.'); });
}
