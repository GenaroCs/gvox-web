import { actualizar, identificador, sesion } from '../core/estado.js';
import { pagarConMonedero } from '../strategies/payment/monedero.js';
import { pagarConTarjetaDemo, pagarConMovilDemo, pagarConVisa, pagarConMastercard, pagarConYape } from '../strategies/payment/externos.js';
import { resumen } from './carrito.js';
import { vigente } from './biblioteca.js';
const estrategias = { monedero: pagarConMonedero, tarjeta: pagarConTarjetaDemo, movil: pagarConMovilDemo, visa: pagarConVisa, mastercard: pagarConMastercard, yape: pagarConYape };
export function pagar(metodo) {
  if (!sesion()) throw new Error('Ingresa con cualquier correo válido antes de confirmar el pago simulado.');
  const compra = resumen();
  if (!compra.articulos.length) throw new Error('Tu carrito está vacío.');
  if (compra.total <= 0) throw new Error('El total debe ser mayor que cero para procesar la simulación.');
  if (compra.articulos.some(item => item.conversionVencida)) throw new Error('El alquiler que ibas a convertir venció. Retira ese artículo y elige una compra normal, sin descuento.');
  if (!estrategias[metodo]) throw new Error('Selecciona un método de pago.');
  return actualizar(datos => {
    for (const item of compra.articulos) {
      if (datos.biblioteca.some(licencia => licencia.juegoId === item.juegoId && vigente(licencia) && !licencia.vence)) throw new Error('Uno de los juegos ya tiene una licencia permanente. Retíralo del carrito.');
    }
    const nombreMetodo = estrategias[metodo](datos, compra.total);
    const momento = Date.now();
    const comprobante = { id: identificador('GV'), estado: 'Pagado', fecha: momento, metodo: nombreMetodo, total: compra.total,
      descuento: compra.descuento, correo: sesion().correo,
      articulos: compra.articulos.map(item => ({ juegoId: item.juegoId, nombre: item.juego.nombre, modalidad: item.modalidad, importe: item.total, descuento: item.descuento })) };
    for (const item of compra.articulos) {
      const anterior = datos.biblioteca.find(licencia => licencia.id === item.conversionDe);
      if (anterior) {
        anterior.modalidad = 'compra'; anterior.vence = null; anterior.pagado += item.total;
        // La conversión conserva la fecha y el uso del alquiler para la regla de reembolso.
      } else {
        const horas = item.modalidad === 'alquiler_48h' ? 48 : item.modalidad === 'alquiler_72h' ? 72 : null;
        datos.biblioteca.push({ id: identificador('lic'), juegoId: item.juegoId, modalidad: item.modalidad,
          fecha: momento, vence: horas ? momento + horas * 3600000 : null, minutos: 0, pagado: item.total, reembolsado: false });
      }
    }
    datos.comprobantes.unshift(comprobante);
    datos.movimientos.unshift({ id: identificador('mov'), tipo: 'pago', concepto: `Compra / alquiler · ${nombreMetodo}`, importe: -compra.total, afectaSaldo: metodo === 'monedero', fecha: momento, comprobanteId: comprobante.id });
    datos.carrito = [];
    return comprobante;
  });
}
export function recargar(importe) {
  if (!Number.isInteger(importe) || importe < 1000 || importe > 100000) throw new Error('La recarga ficticia debe estar entre S/ 10 y S/ 1 000.');
  actualizar(datos => {
    datos.saldo += importe;
    datos.movimientos.unshift({ id: identificador('mov'), tipo: 'recarga', concepto: 'Recarga simulada de monedero', importe, fecha: Date.now() });
  });
}
