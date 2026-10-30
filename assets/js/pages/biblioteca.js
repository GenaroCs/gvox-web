import { buscarJuego, escapar, soles, ruta, ficha, fechaHora } from '../core/datos.js';
import { obtenerEstado } from '../core/estado.js';
import { vigente, tiempoRestante, puedeReembolsar, reembolsar, jugar, crearColeccion, asignarColeccion, eliminarColeccion, renombrarColeccion } from '../services/biblioteca.js';
import { agregar } from '../services/carrito.js';
import { iniciar, barraLateral } from '../components/estructura.js';
import { imagen, vacio } from '../components/fabrica.js';
import { icono } from '../components/iconos.js';
import { intentar, confirmar, formularioDialogo, dialogo, aviso } from '../components/dialogos.js';
iniciar('biblioteca');
document.getElementById('lateral').innerHTML = barraLateral('biblioteca');
let filtro = 'todos';
let estadoVigencias = '';
function licenciasVisibles() {
  const unicos = new Map();
  obtenerEstado().biblioteca.filter(licencia => !licencia.reembolsado).sort((a, b) => a.fecha - b.fecha).forEach(licencia => unicos.set(licencia.juegoId, licencia));
  return [...unicos.values()].sort((a, b) => b.fecha - a.fecha);
}
function pintar() {
  const datos = obtenerEstado();
  if (filtro.startsWith('col-') && !datos.colecciones.some(item => item.id === filtro)) filtro = 'todos';
  document.getElementById('filtros-biblioteca').innerHTML = [...[['todos', 'Todos mis juegos'], ['comprados', 'Comprados'], ['alquileres', 'En alquiler'], ['vencidos', 'Vencidos']], ...datos.colecciones.map(item => [item.id, item.nombre])].map(([valor, texto]) => `<button type="button" role="tab" data-filtro="${valor}" aria-selected="${valor === filtro}">${escapar(texto)}</button>`).join('');
  const coleccion = datos.colecciones.find(item => item.id === filtro);
  document.getElementById('coleccion-activa').innerHTML = coleccion ? `<div class="entre coleccion-cabecera"><span class="pequeno muted">Colección: ${escapar(coleccion.nombre)}</span><div class="acciones-en-linea"><button type="button" class="enlace-texto" data-renombrar="${coleccion.id}">Editar nombre</button><button type="button" class="enlace-texto" data-borrar-coleccion="${coleccion.id}">Eliminar colección</button></div></div>` : '';
  const licencias = licenciasVisibles().filter(licencia => filtro === 'todos' || filtro === 'comprados' && !licencia.vence || filtro === 'alquileres' && licencia.vence && vigente(licencia) || filtro === 'vencidos' && !vigente(licencia) || coleccion?.juegos.includes(licencia.juegoId));
  document.getElementById('juegos-biblioteca').innerHTML = licencias.length ? licencias.map(licencia => {
    const juego = buscarJuego(licencia.juegoId); const activo = vigente(licencia);
    const colecciones = datos.colecciones.filter(item => item.juegos.includes(juego.id));
    return `<article class="biblioteca-tarjeta"><a href="${ficha(juego.id)}" class="biblioteca-arte">${imagen(juego.imagenes.tarjeta_horizontal, juego.nombre)}<span class="etiqueta ${!activo ? 'vencida' : licencia.vence ? 'alquiler' : 'propia'}">${!activo ? 'ALQUILER VENCIDO' : licencia.vence ? 'EN ALQUILER' : 'ES TUYO'}</span></a><div class="biblioteca-info"><a href="${ficha(juego.id)}" class="titulo-juego">${escapar(juego.nombre)}</a><p class="licencia-estado">${icono(activo ? 'escudo' : 'reloj')} ${activo ? 'Licencia vigente' : 'Licencia vencida'}</p>${licencia.vence ? `<div class="tiempo-restante ${activo ? '' : 'vencido'}" data-vence="${licencia.vence}">${activo ? tiempoRestante(licencia.vence) : 'Tu tiempo de alquiler terminó'}</div><small class="fechas-licencia">Activado: ${fechaHora(licencia.fecha)}<br>Vence: ${fechaHora(licencia.vence)} · Lima</small><progress max="100" value="${activo ? Math.min(100, (Date.now() - licencia.fecha) / (licencia.vence - licencia.fecha) * 100) : 100}" aria-label="Tiempo consumido del alquiler"></progress>` : `<div class="tiempo-restante permanente">ACCESO PERMANENTE</div>`}<div class="entre pequeno muted"><span>${licencia.minutos} min de uso ficticio</span><button type="button" class="enlace-texto" data-organizar="${licencia.juegoId}" ${!activo ? 'disabled' : ''}>Organizar</button></div>${colecciones.length ? `<div class="colecciones-mini">${colecciones.map(item => `<span>${escapar(item.nombre)}</span>`).join('')}</div>` : ''}<button type="button" class="boton primario bloque jugar-boton" data-jugar="${licencia.id}" ${!activo ? 'disabled' : ''}>${icono('jugar')} ${activo ? 'JUGAR · SIMULACIÓN' : 'LICENCIA VENCIDA'}</button>${licencia.vence && activo ? `<button type="button" class="boton secundario bloque convertir-boton" data-convertir="${juego.id}">CONVERTIR A COMPRA ${icono('flecha')}</button><small class="conversion-ayuda">Descuenta ${soles(licencia.pagado)} de tu compra.</small>` : !activo ? `<div class="acciones-vencido"><button type="button" class="boton secundario bloque" data-comprar="${juego.id}">COMPRAR JUEGO ↗</button><a href="${ficha(juego.id)}" class="enlace-lima renovar-enlace">VOLVER A ALQUILAR ↗</a></div>` : ''}<button type="button" class="enlace-texto reembolso-boton" data-reembolso="${licencia.id}" ${puedeReembolsar(licencia) ? '' : 'disabled'} title="Menos de 14 días desde la adquisición y menos de 2 horas de uso">${puedeReembolsar(licencia) ? 'Solicitar reembolso simulado' : 'No cumple la regla de reembolso'}</button></div></article>`;
  }).join('') : vacio('Aquí empieza tu próxima colección.', 'No hay juegos en esta selección. Organiza tus licencias vigentes o explora el catálogo.');
  estadoVigencias = licenciasVisibles().map(item => `${item.id}:${vigente(item)}`).join();
}
function organizar(juegoId) {
  const colecciones = obtenerEstado().colecciones;
  if (!colecciones.length) { aviso('Primero crea una colección con el botón de la cabecera.'); return; }
  formularioDialogo('Organizar en colecciones', colecciones.map(item => `<label class="check-linea"><input type="checkbox" name="coleccion" value="${item.id}" ${item.juegos.includes(juegoId) ? 'checked' : ''}>${escapar(item.nombre)}</label>`).join(''), datos => {
    const seleccion = datos.getAll('coleccion');
    for (const coleccion of colecciones) if (seleccion.includes(coleccion.id) !== coleccion.juegos.includes(juegoId)) asignarColeccion(coleccion.id, juegoId);
    aviso('Colecciones actualizadas.');
  });
}
document.getElementById('nueva-coleccion').onclick = () => formularioDialogo('Una colección muy tuya', '<label class="campo">NOMBRE<input name="nombre" required maxlength="40" placeholder="Por ejemplo: Para el fin de semana"></label>', datos => { crearColeccion(datos.get('nombre')); aviso('Colección creada. Usa Organizar en un juego para añadirlo.'); });
document.querySelector('main').addEventListener('click', evento => {
  const boton = evento.target.closest('button'); if (!boton) return;
  if (boton.dataset.filtro) { filtro = boton.dataset.filtro; pintar(); }
  if (boton.dataset.organizar) organizar(boton.dataset.organizar);
  if (boton.dataset.renombrar) { const coleccion = obtenerEstado().colecciones.find(item => item.id === boton.dataset.renombrar); formularioDialogo('Editar colección', `<label class="campo">NOMBRE<input name="nombre" required maxlength="40" value="${escapar(coleccion.nombre)}"></label>`, datos => renombrarColeccion(coleccion.id, datos.get('nombre'))); }
  if (boton.dataset.comprar) intentar(() => { agregar(boton.dataset.comprar, 'compra'); location.href = ruta('pages/carrito.html'); });
  if (boton.dataset.jugar) intentar(() => { jugar(boton.dataset.jugar); dialogo('¡Tu aventura comienza!', '<p class="muted">Simulación de inicio de juego completada. Añadimos 15 minutos ficticios a tu tiempo de uso; no se ejecutó ningún videojuego.</p>'); });
  if (boton.dataset.convertir) intentar(() => { agregar(boton.dataset.convertir, 'compra'); location.href = ruta('pages/carrito.html'); });
  if (boton.dataset.reembolso) confirmar('Solicitar reembolso', 'Si cumples las condiciones, retiraremos esta licencia y abonaremos el importe al monedero ficticio.', () => { reembolsar(boton.dataset.reembolso); aviso('Reembolso simulado completado. El saldo se actualizó.'); });
  if (boton.dataset.borrarColeccion) confirmar('Eliminar colección', 'Se eliminará la agrupación. Los juegos seguirán en tu biblioteca.', () => eliminarColeccion(boton.dataset.borrarColeccion));
});
window.addEventListener('gvox:cambio', pintar);
setInterval(() => {
  const vigencias = licenciasVisibles().map(item => `${item.id}:${vigente(item)}`).join();
  if (vigencias !== estadoVigencias) pintar();
  document.querySelectorAll('[data-vence]').forEach(elemento => { if (Number(elemento.dataset.vence) > Date.now()) elemento.textContent = tiempoRestante(Number(elemento.dataset.vence)); });
}, 1000);
pintar();
