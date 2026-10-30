// Recorridos de negocio con almacenamiento temporal en memoria. No altera la demo del navegador.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const raiz = new URL('../', import.meta.url);
globalThis.fetch = async url => new Response(await readFile(fileURLToPath(url)), { status: 200 });
const almacenamiento = () => ({ getItem(nombre) { return this[nombre] ?? null; }, setItem(nombre, valor) { this[nombre] = String(valor); }, removeItem(nombre) { delete this[nombre]; } });
globalThis.localStorage = almacenamiento(); globalThis.sessionStorage = almacenamiento();
globalThis.window = new EventTarget(); window.location = { reload() {} };
const realNow = Date.now;
let momento = realNow(); Date.now = () => momento;
const estado = await import('../assets/js/core/estado.js');
const datos = await import('../assets/js/core/datos.js');
const carrito = await import('../assets/js/services/carrito.js');
const pagos = await import('../assets/js/services/pagos.js');
const biblioteca = await import('../assets/js/services/biblioteca.js');
const comunidad = await import('../assets/js/services/comunidad.js');
const resultados = [];
const comprobar = (nombre, ejecutar) => { ejecutar(); resultados.push({ prueba: nombre, estado: 'Correcto' }); };
const snapshot = () => JSON.stringify(estado.obtenerEstado());
estado.acceder('cuenta-a@gvox.test', 'Cuenta A');
const saldoInicial = estado.obtenerEstado().saldo;
comprobar('HU11: carrito vacío no procesa pago', () => assert.throws(() => pagos.pagar('monedero'), /vacío/));
carrito.agregar('metaphor-refantazio', 'alquiler_48h');
const importeAlquiler = carrito.resumen().total;
const recibo = pagos.pagar('monedero');
const licencia = biblioteca.licenciaDe('metaphor-refantazio');
comprobar('HU21–HU22: alquiler de 48 horas activado exactamente al pagar', () => {
  assert.equal(licencia.vence - licencia.fecha, 48 * 3600000); assert.equal(licencia.fecha, momento);
  assert.equal(estado.obtenerEstado().saldo, saldoInicial - importeAlquiler); assert.equal(recibo.estado, 'Pagado');
  assert.equal(estado.obtenerEstado().carrito.length, 0);
});
comprobar('HU20: sin licencia no se puede publicar una reseña', () => assert.throws(() => comunidad.publicarResena('stray', true, 'Opinión de prueba sin propiedad.'), /licencia/));
comunidad.publicarResena('metaphor-refantazio', false, 'Una recomendación negativa de demostración.');
comprobar('HU20: recomendación binaria persistida con licencia', () => assert.equal(estado.obtenerEstado().resenas[0].recomienda, false));
carrito.agregar('metaphor-refantazio', 'compra');
comprobar('HU25: descuento del 100 % del alquiler activo', () => assert.equal(carrito.resumen().descuento, importeAlquiler));
pagos.pagar('monedero');
const permanente = biblioteca.licenciaDe('metaphor-refantazio');
comprobar('HU25: conversión sustituye la licencia temporal sin duplicarla', () => {
  assert.equal(permanente.id, licencia.id); assert.equal(permanente.vence, null); assert.equal(permanente.modalidad, 'compra');
  assert.equal(estado.obtenerEstado().biblioteca.filter(item => item.juegoId === 'metaphor-refantazio').length, 1);
});
comprobar('HU14: reembolso convertido devuelve el total efectivamente pagado', () => {
  biblioteca.reembolsar(permanente.id); assert.equal(estado.obtenerEstado().saldo, saldoInicial);
  assert.equal(biblioteca.licenciaDe('metaphor-refantazio'), undefined);
  assert.throws(() => biblioteca.reembolsar(permanente.id));
});
carrito.agregar('cyberpunk-2077', 'compra');
estado.actualizar(demo => { demo.saldo = 0; });
const antesFallo = snapshot();
comprobar('HU12–HU22: pago fallido no cambia saldo, carrito, licencias ni recibos', () => {
  assert.throws(() => pagos.pagar('monedero'), /Saldo insuficiente/); assert.equal(snapshot(), antesFallo);
});
const saldoAntesTarjeta = estado.obtenerEstado().saldo;
pagos.pagar('tarjeta');
comprobar('HU12: tarjeta ficticia aprueba sin descontar el monedero', () => assert.equal(estado.obtenerEstado().saldo, saldoAntesTarjeta));
carrito.agregar('tales-of-arise', 'alquiler_72h'); pagos.pagar('movil');
comprobar('HU12–HU22: pago móvil activa alquiler de 72 horas', () => assert.equal(biblioteca.licenciaDe('tales-of-arise').vence - momento, 72 * 3600000));
carrito.agregar('code-vein', 'alquiler_48h'); pagos.pagar('tarjeta');
carrito.agregar('code-vein', 'compra'); momento += 49 * 3600000;
const antesConversionVencida = snapshot();
comprobar('HU24–HU25: conversión vencida se rechaza sin cobrar ni conceder licencia', () => {
  assert.equal(carrito.resumen().articulos[0].conversionVencida, true);
  assert.throws(() => pagos.pagar('tarjeta'), /venció/); assert.equal(snapshot(), antesConversionVencida);
});
comprobar('HU17–HU24: vencimiento bloquea ejecución y reseñas', () => {
  const temporal = estado.obtenerEstado().biblioteca.find(item => item.juegoId === 'code-vein');
  assert.equal(biblioteca.vigente(temporal), false); assert.throws(() => biblioteca.jugar(temporal.id), /vencido/);
  assert.throws(() => comunidad.publicarResena('code-vein', true, 'Prueba posterior al vencimiento.'), /licencia/);
  assert.equal(biblioteca.tiempoRestante(temporal.vence), '0h 00m 00s');
});
carrito.quitar('code-vein'); carrito.agregar('code-vein', 'compra');
comprobar('HU24: compra normal tras vencimiento no aplica descuento', () => assert.equal(carrito.resumen().descuento, 0));
pagos.pagar('tarjeta');
const compraCode = biblioteca.licenciaDe('code-vein');
comprobar('HU14: límites estrictos de 14 días y 120 minutos', () => {
  assert.equal(biblioteca.puedeReembolsar({ ...compraCode, fecha: momento - 14 * 86400000 }), false);
  assert.equal(biblioteca.puedeReembolsar({ ...compraCode, minutos: 120 }), false);
  assert.equal(biblioteca.puedeReembolsar({ ...compraCode, fecha: momento - 14 * 86400000 + 1, minutos: 119 }), true);
});
biblioteca.crearColeccion('Colección de prueba');
let coleccion = estado.obtenerEstado().colecciones.find(item => item.nombre === 'Colección de prueba');
biblioteca.asignarColeccion(coleccion.id, 'code-vein'); biblioteca.asignarColeccion(coleccion.id, 'cyberpunk-2077'); biblioteca.renombrarColeccion(coleccion.id, 'Dos aventuras');
comprobar('HU18: crear, editar y asignar múltiples juegos', () => {
  coleccion = estado.obtenerEstado().colecciones.find(item => item.id === coleccion.id);
  assert.equal(coleccion.nombre, 'Dos aventuras'); assert.equal(coleccion.juegos.length, 2);
});
biblioteca.eliminarColeccion(coleccion.id);
comprobar('HU18: eliminar colección conserva las licencias', () => { assert.ok(biblioteca.licenciaDe('code-vein')); assert.ok(!estado.obtenerEstado().colecciones.some(item => item.id === coleccion.id)); });
comunidad.gestionarAmigo('noa', 'aceptar'); comunidad.gestionarAmigo('lyra', 'rechazar'); comunidad.gestionarAmigo('akari', 'solicitar'); comunidad.gestionarAmigo('noa', 'bloquear');
comprobar('HU19: amistad, rechazo, solicitud y bloqueo coherentes', () => {
  const demo = estado.obtenerEstado(); assert.ok(demo.bloqueados.includes('noa')); assert.ok(!demo.amigos.includes('noa'));
  assert.ok(!demo.solicitudes.includes('lyra')); assert.ok(demo.enviados.includes('akari'));
});
comunidad.gestionarAmigo('noa', 'desbloquear');
pagos.recargar(5000);
comprobar('HU15: recarga actualiza el saldo y rechaza importes fuera de rango', () => { assert.equal(estado.obtenerEstado().saldo, 5000); assert.throws(() => pagos.recargar(999)); });
comunidad.guardarPerfil({ ...estado.obtenerEstado().perfil, privacidad: 'amigos', nombre: 'Cuenta A', biografia: 'Perfil de prueba.' });
comprobar('HU05: tres niveles válidos de privacidad y validación', () => {
  for (const privacidad of ['publico', 'amigos', 'privado']) comunidad.guardarPerfil({ ...estado.obtenerEstado().perfil, privacidad });
  assert.throws(() => comunidad.guardarPerfil({ ...estado.obtenerEstado().perfil, privacidad: 'otro' }));
});
carrito.alternarFavorito('code-vein'); const favoritosA = estado.obtenerEstado().favoritos;
estado.acceder('cuenta-b@gvox.test', 'Cuenta B');
comprobar('HU10–HU16: cuentas de demo separan biblioteca, saldo y favoritos', () => {
  assert.ok(!estado.obtenerEstado().favoritos.includes('code-vein')); assert.equal(estado.obtenerEstado().saldo, 24000);
  assert.equal(biblioteca.licenciaDe('cyberpunk-2077'), undefined);
});
estado.acceder('cuenta-a@gvox.test', 'Cuenta A');
comprobar('HU10: volver a una cuenta recupera sus favoritos y saldo', () => { assert.deepEqual(estado.obtenerEstado().favoritos, favoritosA); assert.equal(estado.obtenerEstado().saldo, 5000); });
comunidad.guardarPerfil({ ...estado.obtenerEstado().perfil, nombre: 'Nombre personalizado' });
estado.acceder('cuenta-b@gvox.test', 'Cuenta B');
estado.acceder('cuenta-a@gvox.test', '');
comprobar('HU02–HU05: nuevo acceso sin nombre conserva el perfil guardado', () => assert.equal(estado.obtenerEstado().perfil.nombre, 'Nombre personalizado'));
for (const [metodo, juegoId, nombre] of [['visa', 'stray', 'Visa'], ['mastercard', 'scarlet-nexus', 'Mastercard'], ['yape', 'nier-automata', 'Yape']]) {
  carrito.agregar(juegoId, 'alquiler_48h');
  const saldo = estado.obtenerEstado().saldo;
  const comprobante = pagos.pagar(metodo);
  comprobar(`HU12–HU13: ${nombre} conserva identidad y no carga al saldo local`, () => {
    assert.ok(comprobante.metodo.startsWith(nombre));
    assert.equal(estado.obtenerEstado().saldo, saldo);
    assert.ok(biblioteca.licenciaDe(juegoId));
  });
}
carrito.agregar('cult-of-the-lamb', 'compra'); const precioAnterior = datos.buscarJuego('cult-of-the-lamb').precio_demo_soles; datos.buscarJuego('cult-of-the-lamb').precio_demo_soles = 0;
comprobar('HU11: total cero no procesa pagos', () => assert.throws(() => pagos.pagar('tarjeta'), /mayor que cero/));
datos.buscarJuego('cult-of-the-lamb').precio_demo_soles = precioAnterior;
Date.now = realNow;
await writeFile(new URL('docs/registros/final/pruebas-servicios.json', raiz), JSON.stringify({ fecha: new Date().toISOString(), resultados }, null, 2));
console.log(`${resultados.length} recorridos y condiciones de negocio: CORRECTOS.`);
