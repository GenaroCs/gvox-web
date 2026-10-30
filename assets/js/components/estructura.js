import { ruta, escapar, soles, demo, buscarJuego } from '../core/datos.js';
import { obtenerEstado, sesion, salir, restablecer } from '../core/estado.js';
import { alternarFavorito } from '../services/carrito.js';
import { icono } from './iconos.js';
import { confirmar, aviso } from './dialogos.js';
import { avatar } from './fabrica.js';
export function personaActual() {
  const perfil = obtenerEstado().perfil;
  return { ...perfil, rutaAvatar: demo.avatares.find(avatar => avatar.avatar === perfil.avatar)?.rutaAvatar };
}
export function iniciar(pagina) {
  const contenedor = document.getElementById('cabecera');
  const pintar = () => {
    const datos = obtenerEstado();
    contenedor.innerHTML = `<a href="${ruta('index.html')}" class="marca" aria-label="Gvox · Inicio"><img src="${ruta('assets/img/branding/logos/gvox-horizontal-oscuro.svg')}" width="146" height="44" alt="Gvox"></a><nav aria-label="Navegación principal">${[['inicio', 'Inicio', 'index.html'], ['catalogo', 'Explorar juegos', 'pages/catalogo.html'], ['comunidad', 'Comunidad', 'pages/comunidad.html'], ['biblioteca', 'Mi biblioteca', 'pages/biblioteca.html']].map(([id, texto, archivo]) => `<a href="${ruta(archivo)}" ${pagina === id ? 'aria-current="page"' : ''}>${texto}</a>`).join('')}</nav><div class="cabecera-acciones"><a class="boton-icono" href="${ruta('pages/catalogo.html?favoritos=1')}" aria-label="Mis favoritos">${icono('corazon')}</a><a class="boton secundario carrito-enlace" href="${ruta('pages/carrito.html')}">${icono('carrito')} MI CARRITO <span class="contador">${datos.carrito.length}</span></a>${sesion() ? `<a class="cuenta-enlace" href="${ruta('pages/perfil-monedero.html')}" aria-label="Mi perfil y monedero">${avatar(personaActual())}<span>${escapar(datos.perfil.nombre)}<small>${soles(datos.saldo)}</small></span></a><button type="button" class="boton-icono" data-salir aria-label="Cerrar sesión">${icono('salir')}</button>` : `<a class="boton primario" href="${ruta('pages/acceso.html')}">ENTRAR ${icono('flecha')}</a>`}</div>`;
  };
  pintar(); window.addEventListener('gvox:cambio', pintar);
  document.getElementById('pie').innerHTML = `<div><a href="${ruta('index.html')}" class="marca" aria-label="Gvox · Inicio"><img src="${ruta('assets/img/branding/logos/gvox-horizontal-oscuro.svg')}" width="135" height="40" alt="Gvox"></a><span>JUEGA A TU MANERA.</span></div><p>Prototipo académico · Precios, cuentas y operaciones de demostración.</p><button type="button" class="enlace-texto" data-restablecer>Restablecer demo</button>`;
  document.addEventListener('click', evento => {
    const favorito = evento.target.closest('[data-favorito]');
    if (favorito) {
      evento.preventDefault(); alternarFavorito(favorito.dataset.favorito);
      const activo = obtenerEstado().favoritos.includes(favorito.dataset.favorito);
      document.querySelectorAll(`[data-favorito="${favorito.dataset.favorito}"]`).forEach(boton => { boton.classList.toggle('activo', activo); boton.setAttribute('aria-pressed', activo); boton.setAttribute('aria-label', `${activo ? 'Quitar de' : 'Añadir a'} favoritos: ${buscarJuego(favorito.dataset.favorito).nombre}`); });
      aviso(activo ? 'Juego guardado en tus favoritos.' : 'Juego retirado de favoritos.');
    }
    if (evento.target.closest('[data-salir]')) salir();
    if (evento.target.closest('[data-restablecer]')) confirmar('Restablecer la demostración', 'Volverás a los juegos, amigos y saldo de la cuenta de prueba. Se borrarán solo los cambios locales de esta demo.', restablecer);
  });
}
export function barraLateral(activa) {
  return `<aside class="barra-lateral"><div class="perfil-mini">${avatar(personaActual())}<strong>${escapar(obtenerEstado().perfil.nombre)}<small><i class="punto"></i> Mi espacio</small></strong></div><span class="micro muted">TU ESPACIO</span>${[['biblioteca', 'Mi biblioteca', 'biblioteca', 'pages/biblioteca.html'], ['comunidad', 'Comunidad', 'usuarios', 'pages/comunidad.html'], ['perfil', 'Perfil y monedero', 'monedero', 'pages/perfil-monedero.html']].map(([id, texto, dibujo, archivo]) => `<a href="${ruta(archivo)}" class="lateral-enlace ${activa === id ? 'seleccionado' : ''}">${icono(dibujo)} ${texto}</a>`).join('')}<div class="lateral-nota">${icono('escudo')}<strong>Tu próxima aventura,<br>a tu ritmo.</strong><p>Prueba 48 o 72 horas y descuenta tu alquiler al comprar.</p><a href="${ruta('pages/catalogo.html')}" class="enlace-lima">Descubrir juegos ↗</a></div></aside>`;
}
