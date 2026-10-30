import { ruta, ficha, escapar, soles, modalidades } from '../core/datos.js';
import { obtenerEstado, sesion } from '../core/estado.js';
import { resumen, agregar, quitar } from '../services/carrito.js';
import { pagar } from '../services/pagos.js';
import { iniciar } from '../components/estructura.js';
import { imagen, vacio } from '../components/fabrica.js';
import { icono } from '../components/iconos.js';
import { intentar, aviso } from '../components/dialogos.js';
import { verComprobante } from '../components/comprobante.js';
iniciar('carrito');
const root = document.getElementById('checkout');
let metodo = 'monedero';
let totalMostrado = 0;
function pintar() {
  const compra = resumen(); totalMostrado = compra.total;
  if (!compra.articulos.length) {
    root.innerHTML = `${vacio('Tu carrito está esperando una buena historia.', 'Explora el catálogo y elige comprar o alquilar tu próximo juego.')}<div class="carrito-vacio-pie"><a class="enlace-lima" href="${ruta('pages/biblioteca.html')}">IR A MI BIBLIOTECA →</a></div>`; return;
  }
  root.innerHTML = `<div class="checkout-columnas"><section><div class="panel"><div class="panel-interior entre"><span class="micro">TU CARRITO</span><span class="micro muted">${compra.articulos.length} ${compra.articulos.length === 1 ? 'JUEGO' : 'JUEGOS'}</span></div>${compra.articulos.map(item => `<article class="carrito-articulo">${imagen(item.juego.imagenes.tarjeta_horizontal, item.juego.nombre)}<div><a href="${ficha(item.juegoId)}" class="articulo-titulo">${escapar(item.juego.nombre)}</a><label class="campo"><span class="solo-lectores">Modalidad de ${escapar(item.juego.nombre)}</span><select data-modalidad="${item.juegoId}">${Object.entries(modalidades).map(([valor, texto]) => `<option value="${valor}" ${valor === item.modalidad ? 'selected' : ''}>${texto}</option>`).join('')}</select></label>${item.conversionVencida ? '<small class="calido">La conversión venció. Retira el artículo para elegir una compra normal.</small>' : ''}${item.descuento ? `<small class="calido">−${soles(item.descuento)} por tu alquiler activo</small>` : ''}</div><div class="articulo-importe"><strong>${soles(item.total)}</strong><button type="button" class="boton-icono" data-quitar="${item.juegoId}" aria-label="Eliminar ${escapar(item.juego.nombre)}">${icono('papelera')}</button></div></article>`).join('')}</div><div class="panel panel-interior metodos-panel"><span class="ceja">MÉTODO DE PAGO</span><h3>Paga como prefieras<span class="lima">.</span></h3><div class="metodos">${[['monedero', 'monedero', 'Saldo Gvox', soles(obtenerEstado().saldo) + ' disponibles'], ['visa', 'recibo', 'Visa', 'Tarjeta · Sin datos bancarios'], ['mastercard', 'recibo', 'Mastercard', 'Tarjeta · Sin datos bancarios'], ['yape', 'escudo', 'Yape', 'Billetera · Sin aplicación externa']].map(([valor, dibujo, texto, ayuda]) => `<label class="metodo ${valor === metodo ? 'seleccionado' : ''}"><input type="radio" name="metodo" value="${valor}" ${valor === metodo ? 'checked' : ''}>${valor === 'monedero' ? icono(dibujo) : `<span class="pago-marca ${valor}" aria-hidden="true">${valor === 'mastercard' ? '<i></i><i></i>' : texto}</span>`}<strong>${texto}</strong><small>${ayuda}</small></label>`).join('')}</div><p class="nota-simulacion">${icono('escudo')} Ningún método mueve dinero real. No ingreses datos bancarios.</p></div><a class="enlace-lima seguir-explorando" href="${ruta('pages/catalogo.html')}">← SEGUIR EXPLORANDO</a></section><aside><div class="panel panel-interior resumen-pago"><span class="ceja">RESUMEN DE TU PEDIDO</span><div class="resumen-fila"><span>Subtotal</span><strong>${soles(compra.subtotal)}</strong></div><div class="resumen-fila calido"><span>Descuento por alquiler</span><strong>−${soles(compra.descuento)}</strong></div><div class="separador"></div><div class="resumen-fila total"><span>TOTAL</span><strong>${soles(compra.total)}</strong></div>${sesion() ? `<button class="boton primario bloque" id="confirmar-pago" type="button">SIMULAR PAGO · ${soles(compra.total)} ${icono('flecha')}</button>` : `<a class="boton primario bloque" href="${ruta('pages/acceso.html?volver=carrito')}">ENTRAR Y CONTINUAR ${icono('flecha')}</a><p class="pequeno muted">Usa cualquier correo válido y código numérico.</p>`}<span class="nota-simulacion">${icono('escudo')} Comprobante local al completar la simulación.</span></div><div class="regla-alquiler panel panel-interior"><span class="ceja">¿TE QUEDAS CON EL JUEGO?</span><h3>Tu alquiler cuenta.</h3><p>Al convertir un alquiler activo en compra, descontamos el <strong>100 % de lo que pagaste</strong>. El descuento se calcula aquí automáticamente.</p><a href="${ruta('pages/perfil-monedero.html')}" class="enlace-lima">VER MI MONEDERO ↗</a></div></aside></div>`;
}
root.addEventListener('change', evento => {
  if (evento.target.matches('[data-modalidad]')) { const resultado = intentar(() => agregar(evento.target.dataset.modalidad, evento.target.value)); if (resultado === false) pintar(); }
  if (evento.target.name === 'metodo') { metodo = evento.target.value; pintar(); root.querySelector(`[name=metodo][value=${metodo}]`).focus(); }
});
root.addEventListener('click', evento => {
  const quitarBoton = evento.target.closest('[data-quitar]');
  if (quitarBoton) quitar(quitarBoton.dataset.quitar);
  if (evento.target.closest('#confirmar-pago')) {
    if (resumen().total !== totalMostrado) { pintar(); aviso('Un alquiler cambió de vigencia. Revisa el total actualizado antes de continuar.', true); return; }
    const comprobante = intentar(() => pagar(metodo));
    if (comprobante) verComprobante(comprobante);
  }
});
window.addEventListener('gvox:cambio', pintar);
pintar();
