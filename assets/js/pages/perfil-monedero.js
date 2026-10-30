import { demo, escapar, soles, fecha, ruta } from '../core/datos.js';
import { obtenerEstado, actualizar, sesion } from '../core/estado.js';
import { guardarPerfil } from '../services/comunidad.js';
import { recargar } from '../services/pagos.js';
import { vigente } from '../services/biblioteca.js';
import { iniciar, barraLateral, personaActual } from '../components/estructura.js';
import { imagen, avatar } from '../components/fabrica.js';
import { icono } from '../components/iconos.js';
import { formularioDialogo, dialogo, aviso, intentar } from '../components/dialogos.js';
import { verComprobante, numeroComprobante } from '../components/comprobante.js';
iniciar('perfil');
document.getElementById('lateral').innerHTML = barraLateral('perfil');
const root = document.getElementById('perfil-contenido');
function pintar() {
  const datos = obtenerEstado(); const perfil = datos.perfil;
  const licencias = datos.biblioteca.filter(vigente);
  root.innerHTML = `<div class="perfil-banner">${imagen(demo.recursos.banner_perfil, 'Islas flotantes y cascadas del mundo de Gvox', { prioridad: true })}<span>TU PRÓXIMA HISTORIA ESTÁ POR COMENZAR</span></div><div class="perfil-identidad">${avatar(personaActual(), 'grande')}<div><h2>${escapar(perfil.nombre)}</h2><p>${escapar(perfil.biografia)}</p><span class="micro muted"><i class="punto"></i> ${{ publico: 'PERFIL PÚBLICO', amigos: 'SOLO AMIGOS', privado: 'PERFIL PRIVADO' }[perfil.privacidad]}</span></div><button type="button" class="boton secundario" id="editar-perfil">EDITAR PERFIL ${icono('flecha')}</button></div><div class="estadisticas"><div class="estadistica"><strong>${licencias.filter(item => !item.vence).length}</strong><span>Juegos comprados</span></div><div class="estadistica"><strong>${licencias.filter(item => item.vence).length}</strong><span>Alquileres activos</span></div><div class="estadistica"><strong>${datos.amigos.length}</strong><span>Amigos</span></div></div><div class="perfil-columnas"><section class="apilado"><div class="panel panel-interior monedero-panel"><div class="entre"><span class="ceja">MI MONEDERO</span>${icono('monedero')}</div><p class="micro muted">SALDO FICTICIO DISPONIBLE</p><strong class="saldo-grande">${soles(datos.saldo)}</strong><div class="acciones-en-linea"><button type="button" class="boton primario" id="recargar">RECARGAR SALDO ${icono('mas')}</button>${[20, 50, 100].map(importe => `<button type="button" class="boton secundario pequeno" data-recarga="${importe}">+ S/ ${importe}</button>`).join('')}</div><p class="nota-simulacion">${icono('escudo')} Recargas locales sin dinero real ni información bancaria.</p></div><div class="panel panel-interior"><div class="entre"><span class="ceja">TU CUENTA</span><button type="button" class="enlace-lima sin-borde" id="vista-publica">VISTA DE VISITANTE ↗</button></div><div class="dato-cuenta"><span>Correo de la sesión</span><strong>${escapar(sesion()?.correo || 'Aún no has iniciado sesión')}</strong></div><div class="dato-cuenta"><span>Privacidad</span><strong>${{ publico: 'Público', amigos: 'Solo amigos', privado: 'Solo tú' }[perfil.privacidad]}</strong></div><div class="dato-cuenta"><span>Actividad visible</span><strong>${perfil.mostrarActividad ? 'Activada' : 'Desactivada'}</strong></div><button class="boton secundario bloque privacidad-boton" type="button" id="privacidad">AJUSTAR PRIVACIDAD</button></div></section><section class="panel panel-interior historial-panel"><div class="entre"><span class="ceja">ÚLTIMOS MOVIMIENTOS</span></div><div class="movimientos">${datos.movimientos.slice(0, 30).map(movimiento => `<article class="movimiento"><span class="movimiento-icono">${icono(movimiento.tipo === 'recarga' ? 'mas' : movimiento.tipo === 'reembolso' ? 'flecha' : 'carrito')}</span><div><strong>${escapar(movimiento.concepto)}</strong><small>${fecha(movimiento.fecha)}${movimiento.afectaSaldo === false ? ' · Sin cargo en el monedero' : ''}</small></div><b class="${movimiento.importe > 0 ? 'lima' : 'calido'}">${movimiento.importe > 0 ? '+' : '−'}${soles(Math.abs(movimiento.importe))}</b></article>`).join('')}</div></section></div><section class="panel panel-interior comprobantes-panel"><div class="cabecera-seccion"><div><span class="ceja">TODO EN SU SITIO</span><h3>Mis comprobantes.</h3></div><a href="${ruta('pages/biblioteca.html')}" class="enlace-lima">MI BIBLIOTECA ↗</a></div>${datos.comprobantes.length ? datos.comprobantes.map(compra => `<div class="comprobante-fila"><span>${icono('recibo')} <strong>${numeroComprobante(compra.id)}</strong></span><span class="pequeno muted">${fecha(compra.fecha)} · ${compra.articulos.length} juego(s)</span><strong>${soles(compra.total)}</strong><button class="boton secundario pequeno" type="button" data-comprobante="${compra.id}">VER COMPROBANTE ↗</button></div>`).join('') : '<p class="pequeno muted">Tus próximas compras y alquileres simulados aparecerán aquí con su comprobante local.</p>'}</section>`;
}
function editarPerfil() {
  const perfil = obtenerEstado().perfil;
  formularioDialogo('Tu espacio empieza contigo', `<label class="campo">NOMBRE<input name="nombre" value="${escapar(perfil.nombre)}" required maxlength="30"></label><label class="campo">BIOGRAFÍA<textarea name="biografia" maxlength="200">${escapar(perfil.biografia)}</textarea></label><button type="button" class="boton secundario" id="cambiar-avatar">CAMBIAR AVATAR</button>`, datos => { guardarPerfil({ ...obtenerEstado().perfil, nombre: datos.get('nombre'), biografia: datos.get('biografia') }); aviso('Perfil actualizado.'); }).querySelector('#cambiar-avatar').onclick = seleccionarAvatar;
}
function seleccionarAvatar() {
  const actual = obtenerEstado().perfil.avatar;
  const ventana = dialogo('Elige tu avatar', `<div class="seleccion-avatar">${demo.avatares.map((opcion, indice) => `<button type="button" data-avatar="${opcion.avatar}" aria-label="Elegir avatar ${indice + 1}" aria-pressed="${opcion.avatar === actual}">${avatar(opcion)}</button>`).join('')}</div>`);
  ventana.addEventListener('click', evento => {
    const boton = evento.target.closest('[data-avatar]');
    if (boton) { actualizar(datos => { datos.perfil.avatar = boton.dataset.avatar; }); ventana.close(); aviso('Avatar actualizado.'); }
  });
}
function privacidad() {
  const perfil = obtenerEstado().perfil;
  formularioDialogo('Tú eliges qué compartir', `<label class="campo">VISIBILIDAD DEL PERFIL<select name="privacidad">${[['publico', 'Público'], ['amigos', 'Solo amigos'], ['privado', 'Privado']].map(([valor, texto]) => `<option value="${valor}" ${perfil.privacidad === valor ? 'selected' : ''}>${texto}</option>`).join('')}</select></label><label class="check-linea"><input type="checkbox" name="actividad" ${perfil.mostrarActividad ? 'checked' : ''}> Mostrar mi actividad en la vista de visitante</label><p class="pequeno muted">Preferencias guardadas solo en este navegador. Prueba su efecto con Vista de visitante.</p>`, datos => { guardarPerfil({ ...obtenerEstado().perfil, privacidad: datos.get('privacidad'), mostrarActividad: datos.has('actividad') }); aviso('Privacidad actualizada.'); });
}
function recargaPersonalizada() {
  formularioDialogo('Un poco más para tu próxima aventura', '<label class="campo">IMPORTE EN SOLES<input name="importe" type="number" min="10" max="1000" step="0.01" required value="50"><small>De S/ 10 a S/ 1 000 · Saldo ficticio</small></label>', datos => { recargar(Math.round(Number(datos.get('importe')) * 100)); aviso('Recarga ficticia completada.'); });
}
root.addEventListener('click', evento => {
  const boton = evento.target.closest('button'); if (!boton) return;
  if (boton.id === 'editar-perfil') editarPerfil();
  if (boton.id === 'privacidad') privacidad();
  if (boton.id === 'recargar') recargaPersonalizada();
  if (boton.dataset.recarga) intentar(() => recargar(Number(boton.dataset.recarga) * 100), 'Recarga ficticia completada.');
  if (boton.dataset.comprobante) verComprobante(obtenerEstado().comprobantes.find(compra => compra.id === boton.dataset.comprobante));
  if (boton.id === 'vista-publica') {
    const datos = obtenerEstado();
    const ventana = dialogo('Vista de visitante · Simulación', '<label class="campo">VER COMO<select id="tipo-visitante"><option value="visitante">Visitante</option><option value="amigo">Amigo</option></select></label><div id="vista-perfil" class="vista-perfil"></div>');
    const mostrarVisita = () => {
      const puedeVer = datos.perfil.privacidad === 'publico' || datos.perfil.privacidad === 'amigos' && ventana.querySelector('#tipo-visitante').value === 'amigo';
      ventana.querySelector('#vista-perfil').innerHTML = puedeVer ? `${avatar(personaActual(), 'grande')}<h3>${escapar(datos.perfil.nombre)}</h3><p class="muted">${escapar(datos.perfil.biografia)}</p><p class="pequeno">${datos.perfil.mostrarActividad ? `Actividad visible: ${datos.biblioteca.filter(vigente).length} licencias vigentes de demostración.` : 'Este jugador ha ocultado su actividad.'}</p>` : '<p class="muted">Este perfil no es visible para este visitante según las preferencias locales.</p>';
    };
    ventana.querySelector('#tipo-visitante').onchange = mostrarVisita;
    mostrarVisita();
  }
});
window.addEventListener('gvox:cambio', () => { pintar(); document.getElementById('lateral').innerHTML = barraLateral('perfil'); });
pintar();
