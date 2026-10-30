import { ruta } from '../core/datos.js';
import { acceder } from '../core/estado.js';
import { iniciar } from '../components/estructura.js';
import { aviso } from '../components/dialogos.js';
iniciar('acceso');
let modo = 'login';
let correoPendiente = '';
let nombrePendiente = '';
const formulario = document.getElementById('form-acceso');
const codigo = document.getElementById('form-codigo');
const campoNombre = document.getElementById('campo-nombre');
const volverCarrito = new URLSearchParams(location.search).get('volver') === 'carrito';
codigo.querySelector('[type=submit]').textContent = volverCarrito ? 'CONTINUAR A MI CARRITO ↗' : 'ENTRAR A MI BIBLIOTECA ↗';
function cambiarModo(valor) {
  modo = valor;
  formulario.hidden = false; codigo.classList.add('oculto');
  document.querySelector('.pestanas').hidden = false;
  document.querySelectorAll('[data-modo]').forEach(boton => boton.setAttribute('aria-selected', boton.dataset.modo === modo));
  campoNombre.classList.toggle('oculto', modo !== 'registro');
  document.getElementById('nombre').required = modo === 'registro';
  document.getElementById('continuar-acceso').textContent = modo === 'registro' ? 'CREAR CUENTA DE DEMOSTRACIÓN ↗' : modo === 'recuperar' ? 'RECUPERAR ACCESO SIMULADO ↗' : 'CONTINUAR ↗';
  document.getElementById('acceso-ayuda').textContent = modo === 'recuperar' ? 'Recuperación local: ningún correo será enviado.' : 'Tu biblioteca, tus amigos y una nueva historia te esperan.';
}
document.querySelectorAll('[data-modo]').forEach(boton => { boton.onclick = () => cambiarModo(boton.dataset.modo); });
document.getElementById('recuperar').onclick = () => cambiarModo('recuperar');
document.getElementById('cuenta-prueba').onclick = () => { cambiarModo('login'); document.getElementById('correo').value = 'demo@gvox.test'; aviso('Correo de prueba preparado. Continúa y escribe cualquier código numérico.'); };
formulario.onsubmit = evento => {
  evento.preventDefault();
  if (!formulario.reportValidity()) return;
  correoPendiente = document.getElementById('correo').value.trim();
  nombrePendiente = modo === 'registro' ? document.getElementById('nombre').value.trim() : '';
  if (modo === 'registro' && !nombrePendiente) { aviso('Escribe tu nombre para la cuenta de demostración.', true); return; }
  formulario.hidden = true; document.querySelector('.pestanas').hidden = true;
  codigo.classList.remove('oculto');
  document.getElementById('codigo-ayuda').textContent = `${modo === 'recuperar' ? 'Recuperación simulada' : 'Acceso simulado'} para ${correoPendiente}. No se envió un correo. Cualquier código numérico permite continuar.`;
  document.getElementById('codigo').focus();
};
document.getElementById('cambiar-correo').onclick = () => cambiarModo(modo);
codigo.onsubmit = evento => {
  evento.preventDefault();
  if (!/^[0-9]+$/.test(document.getElementById('codigo').value)) { aviso('Escribe cualquier secuencia de números.', true); return; }
  acceder(correoPendiente, nombrePendiente);
  location.href = ruta(volverCarrito ? 'pages/carrito.html' : 'pages/biblioteca.html');
};
