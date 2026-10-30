import { juegos, ficha, detalleDe, soles, precioCompra } from '../core/datos.js';
import { iniciar } from '../components/estructura.js';
import { tarjetaJuego, imagen } from '../components/fabrica.js';
iniciar('inicio');
document.getElementById('recomendados').innerHTML = juegos.filter(juego => juego.destacado).slice(0, 5).map(juego => tarjetaJuego(juego, { vertical: true })).join('');
document.getElementById('promociones').innerHTML = ['persona-5-royal', 'tales-of-arise', 'cyberpunk-2077'].map(id => {
  const juego = juegos.find(item => item.id === id);
  return `<a class="promo-editorial" href="${ficha(id)}">${imagen(juego.imagenes.tarjeta_horizontal, juego.nombre)}<div class="promo-degradado"></div><div class="promo-contenido"><span class="etiqueta calida">−${detalleDe(id).oferta}% · EN OFERTA</span><h3>${juego.nombre}</h3><div class="entre"><span>Tu próxima historia</span><strong>${soles(precioCompra(juego))} ↗</strong></div></div></a>`;
}).join('');
