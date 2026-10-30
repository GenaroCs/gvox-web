import { ruta, imagenes, escapar, ficha, soles, precioCompra, detalleDe } from '../core/datos.js';
import { obtenerEstado } from '../core/estado.js';
import { icono } from './iconos.js';
export function imagen(archivo, texto, opciones = {}) {
  const info = imagenes[archivo] || {};
  return `<img src="${ruta(archivo)}" alt="${escapar(texto)}" ${info.ancho ? `width="${info.ancho}" height="${info.alto}"` : ''} loading="${opciones.prioridad ? 'eager' : 'lazy'}" decoding="async" ${opciones.prioridad ? 'fetchpriority="high"' : ''} class="${opciones.clase || ''}">`;
}
export function tarjetaJuego(juego, { vertical = false } = {}) {
  const favorito = obtenerEstado().favoritos.includes(juego.id);
  const oferta = detalleDe(juego.id).oferta;
  return `<article class="tarjeta-juego ${vertical ? 'vertical' : ''}"><div class="tarjeta-arte"><a href="${ficha(juego.id)}" aria-label="Ver ${escapar(juego.nombre)}">${imagen(vertical ? juego.imagenes.portada_vertical : juego.imagenes.tarjeta_horizontal, juego.nombre)}</a><span class="etiqueta ${oferta ? 'calida' : ''}">${oferta ? `−${oferta}%` : juego.destacado ? 'SELECCIÓN GVOX' : 'COMPRA O ALQUILA'}</span><button type="button" class="favorito ${favorito ? 'activo' : ''}" data-favorito="${juego.id}" aria-label="${favorito ? 'Quitar de' : 'Añadir a'} favoritos: ${escapar(juego.nombre)}" aria-pressed="${favorito}">${icono('corazon')}</button></div><div class="tarjeta-info"><span class="micro muted">${escapar(juego.coleccion)}</span><a class="titulo-juego" href="${ficha(juego.id)}">${escapar(juego.nombre)}</a><div class="tarjeta-precio"><strong>${soles(precioCompra(juego))}</strong><a href="${ficha(juego.id)}" class="alquiler-mini">48 / 72 h ${icono('flecha')}</a></div></div></article>`;
}
export const vacio = (titulo, texto, enlace = ruta('pages/catalogo.html'), boton = 'Explorar catálogo') => `<div class="estado-vacio">${icono('biblioteca')}<h3>${escapar(titulo)}</h3><p>${escapar(texto)}</p>${enlace ? `<a class="boton primario" href="${enlace}">${boton} ${icono('flecha')}</a>` : ''}</div>`;
export function avatar(persona, clase = '') {
  const archivo = persona.rutaAvatar;
  return archivo ? imagen(archivo, `Avatar de ${persona.nombre}`, { clase: `avatar ${clase}` }) : `<span class="avatar ${clase}">${escapar(persona.nombre.slice(0, 2).toUpperCase())}</span>`;
}
