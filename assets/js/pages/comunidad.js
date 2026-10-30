import { demo, juegos, buscarJuego, galeriaDe, escapar, ficha } from '../core/datos.js';
import { obtenerEstado } from '../core/estado.js';
import { gestionarAmigo, publicar, alternarLike } from '../services/comunidad.js';
import { iniciar, barraLateral, personaActual } from '../components/estructura.js';
import { imagen, avatar, vacio } from '../components/fabrica.js';
import { icono } from '../components/iconos.js';
import { formularioDialogo, intentar, aviso } from '../components/dialogos.js';
import { listaResenas, escribirResena } from '../components/resenas.js';
iniciar('comunidad');
document.getElementById('lateral').innerHTML = barraLateral('comunidad');
let vista = 'feed';
function persona(id) { return id === 'yo' ? personaActual() : demo.usuarios.find(usuario => usuario.id === id); }
function usuarioFila(id, acciones) {
  const usuario = persona(id);
  return `<div class="amigo-fila">${avatar(usuario)}<div><strong>${escapar(usuario.nombre)}</strong><small>${`<i class="punto estado-${usuario.estado === 'en línea' ? 'online' : usuario.estado === 'ausente' ? 'ausente' : 'offline'}"></i>`} ${escapar(usuario.estado || 'desconectado')}</small></div><div class="amigo-acciones">${acciones}</div></div>`;
}
const botonAmigo = (id, accion, texto, secundario = false) => `<button type="button" class="${secundario ? 'enlace-texto' : 'boton pequeno secundario'}" data-persona="${id}" data-amistad="${accion}">${texto}</button>`;
function pintar() {
  const datos = obtenerEstado();
  document.querySelectorAll('[data-vista]').forEach(boton => boton.setAttribute('aria-selected', boton.dataset.vista === vista));
  const feed = document.getElementById('feed');
  if (vista === 'resenas') feed.innerHTML = `<div class="panel panel-interior"><div class="entre"><span class="ceja">OPINIONES CON UNA HISTORIA DETRÁS</span><button type="button" class="enlace-lima sin-borde" id="resena-comunidad">ESCRIBIR RESEÑA ↗</button></div>${listaResenas()}</div>`;
  else {
    const publicaciones = datos.publicaciones.filter(post => !datos.bloqueados.includes(post.usuarioId));
    feed.innerHTML = `<div class="comunidad-bienvenida"><span class="ceja">TU PUNTO DE ENCUENTRO</span><h2>Historias que se comparten.</h2><p>Lo que estás jugando, lo que descubriste y esa partida que todavía comentas.</p></div>${publicaciones.length ? publicaciones.map(post => {
      const usuario = persona(post.usuarioId); const juego = buscarJuego(post.juegoId);
      const archivo = demo.recursos[post.imagenId] || galeriaDe(post.juegoId).capturas[0];
      const like = datos.likes.includes(post.id);
      return `<article class="publicacion panel"><div class="publicacion-cabecera">${avatar(usuario)}<div><strong>${escapar(usuario.nombre)}</strong><small>${post.usuarioId === 'yo' ? 'Acabas de compartir un momento' : post.usuarioId === 'mika' ? 'Explorando nuevos mundos' : post.usuarioId === 'ren' ? 'Entre misiones' : 'Una partida más'}</small></div><a href="${ficha(juego.id)}" class="insignia">${escapar(juego.nombre)}</a></div><p>${escapar(post.texto)}</p><a href="${ficha(juego.id)}" class="publicacion-imagen">${imagen(archivo, `Captura de ${juego.nombre}`)}</a><div class="publicacion-pie"><button type="button" class="reaccion ${like ? 'activa' : ''}" data-like="${post.id}" aria-pressed="${like}">${icono('corazon')} ${like ? 'Te gusta' : 'Me gusta'}</button><a href="${ficha(juego.id)}" class="enlace-lima">DESCUBRIR EL JUEGO ↗</a></div></article>`;
    }).join('') : vacio('Tu comunidad está tranquila.', 'Comparte tu primera publicación de demostración.', null)}`;
  }
  const sugeridos = demo.usuarios.filter(usuario => ![...datos.amigos, ...datos.solicitudes, ...datos.bloqueados].includes(usuario.id)).slice(0, 4);
  document.getElementById('amigos').innerHTML = `<div class="panel panel-interior"><div class="entre"><span class="ceja">AMIGOS CONECTADOS</span><span class="contador">${datos.amigos.filter(id => persona(id).estado === 'en línea').length}</span></div>${datos.amigos.length ? datos.amigos.map(id => usuarioFila(id, botonAmigo(id, 'bloquear', 'Bloquear', true))).join('') : '<p class="pequeno muted">Aún no tienes amigos en esta demo.</p>'}</div><div class="panel panel-interior"><span class="ceja">SOLICITUDES · ${datos.solicitudes.length}</span>${datos.solicitudes.length ? datos.solicitudes.map(id => usuarioFila(id, botonAmigo(id, 'aceptar', 'Aceptar') + botonAmigo(id, 'rechazar', 'Rechazar', true))).join('') : '<p class="pequeno muted">No tienes solicitudes pendientes.</p>'}</div><div class="panel panel-interior"><span class="ceja">GENTE POR CONOCER</span>${sugeridos.map(usuario => usuarioFila(usuario.id, datos.enviados.includes(usuario.id) ? '<span class="pequeno lima">Solicitud enviada</span>' : botonAmigo(usuario.id, 'solicitar', '+ Añadir'))).join('')}</div><details class="panel panel-interior"><summary class="micro muted">BLOQUEADOS · ${datos.bloqueados.length}</summary>${datos.bloqueados.map(id => usuarioFila(id, botonAmigo(id, 'desbloquear', 'Desbloquear'))).join('') || '<p class="pequeno muted">No hay usuarios bloqueados.</p>'}</details>`;
}
document.getElementById('nueva-publicacion').onclick = () => formularioDialogo('Comparte un buen momento', `<label class="campo">VIDEOJUEGO<select name="juegoId">${juegos.map(juego => `<option value="${juego.id}">${escapar(juego.nombre)}</option>`).join('')}</select></label><label class="campo">TU PUBLICACIÓN<textarea name="texto" required minlength="5" maxlength="1000" placeholder="¿Qué estás jugando hoy?"></textarea></label><p class="pequeno muted">Añadiremos una captura existente del juego seleccionado. Se guardará solo en este navegador.</p>`, datos => { publicar(datos.get('juegoId'), datos.get('texto')); aviso('Momento compartido en la comunidad local.'); });
document.querySelector('main').addEventListener('click', evento => {
  const boton = evento.target.closest('button'); if (!boton) return;
  if (boton.dataset.vista) { vista = boton.dataset.vista; pintar(); }
  if (boton.dataset.like) alternarLike(boton.dataset.like);
  if (boton.dataset.amistad) intentar(() => gestionarAmigo(boton.dataset.persona, boton.dataset.amistad), 'Tu lista de amigos se actualizó.');
  if (boton.id === 'resena-comunidad') escribirResena();
});
window.addEventListener('gvox:cambio', pintar);
pintar();
