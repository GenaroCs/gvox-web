import { escapar } from '../core/datos.js';
import { icono } from './iconos.js';
export function aviso(texto, error = false) {
  let region = document.getElementById('avisos');
  if (!region) {
    region = document.createElement('div'); region.id = 'avisos'; region.setAttribute('role', 'status'); region.setAttribute('aria-live', 'polite'); document.body.append(region);
  }
  const mensaje = document.createElement('div');
  mensaje.className = `aviso ${error ? 'error' : ''}`;
  mensaje.textContent = texto; region.append(mensaje);
  setTimeout(() => mensaje.remove(), 5200);
}
export function intentar(accion, mensaje) {
  try { const resultado = accion(); if (mensaje) aviso(mensaje); return resultado; }
  catch (error) { aviso(error.message, true); return false; }
}
export function dialogo(titulo, contenido) {
  const ventana = document.createElement('dialog');
  ventana.className = 'dialogo';
  ventana.innerHTML = `<div class="dialogo-cabecera"><div><span class="ceja">GVOX · DEMOSTRACIÓN</span><h2>${escapar(titulo)}</h2></div><button type="button" class="boton-icono" data-cerrar aria-label="Cerrar ventana">${icono('cerrar')}</button></div>${contenido}`;
  document.body.append(ventana);
  ventana.querySelector('[data-cerrar]').onclick = () => ventana.close();
  ventana.addEventListener('close', () => ventana.remove(), { once: true });
  ventana.addEventListener('click', evento => { if (evento.target === ventana) { const caja = ventana.getBoundingClientRect(); if (evento.clientX < caja.left || evento.clientX > caja.right || evento.clientY < caja.top || evento.clientY > caja.bottom) ventana.close(); } });
  ventana.showModal();
  return ventana;
}
export function formularioDialogo(titulo, campos, guardar) {
  const ventana = dialogo(titulo, `<form class="formulario">${campos}<button class="boton primario" type="submit">Guardar ${icono('check')}</button></form>`);
  ventana.querySelector('form').onsubmit = evento => {
    evento.preventDefault();
    try { guardar(new FormData(evento.target)); ventana.close(); } catch (error) { aviso(error.message, true); }
  };
  return ventana;
}
export function confirmar(titulo, texto, accion) {
  const ventana = dialogo(titulo, `<p class="muted">${escapar(texto)}</p><button type="button" class="boton primario" data-confirmar>Confirmar ${icono('check')}</button>`);
  ventana.querySelector('[data-confirmar]').onclick = () => { ventana.close(); intentar(accion); };
}
