import { soles, fecha, modalidades, escapar } from '../core/datos.js';
import { dialogo } from './dialogos.js';
import { icono } from './iconos.js';
export const numeroComprobante = id => id.split('-').slice(0, 2).join('-').toUpperCase();
export function verComprobante(compra) {
  const numero = numeroComprobante(compra.id);
  const ventana = dialogo('Tu próxima aventura ya está lista.', `<div class="comprobante"><span class="insignia">${icono('check')} PAGO SIMULADO COMPLETADO</span><p class="pequeno muted">${numero} · ${fecha(compra.fecha)}<br>${escapar(compra.correo)}<br>${escapar(compra.metodo)}</p>${compra.articulos.map(item => `<div class="comprobante-linea"><span><strong>${escapar(item.nombre)}</strong><small>${modalidades[item.modalidad]}</small></span><b>${soles(item.importe)}</b></div>`).join('')}<div class="comprobante-linea"><strong>TOTAL DEMOSTRATIVO</strong><strong class="lima">${soles(compra.total)}</strong></div><p class="pequeno muted">Este comprobante es local y ficticio. No acredita una transacción real ni se envió por correo.</p><button type="button" class="boton secundario bloque" id="descargar-comprobante">${icono('recibo')} DESCARGAR COMPROBANTE</button></div>`);
  ventana.querySelector('#descargar-comprobante').onclick = () => {
    const lineas = ['GVOX · COMPROBANTE DE DEMOSTRACIÓN', numero, fecha(compra.fecha), compra.correo, compra.metodo, '', ...compra.articulos.map(item => `${item.nombre} · ${modalidades[item.modalidad]} · ${soles(item.importe)}`), '', `Descuento por alquiler: ${soles(compra.descuento)}`, `TOTAL: ${soles(compra.total)}`, '', 'Documento ficticio de un prototipo académico. Sin dinero real ni envío de correo.'];
    const url = URL.createObjectURL(new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const enlace = document.createElement('a'); enlace.href = url; enlace.download = `${numero}.txt`; enlace.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
}
