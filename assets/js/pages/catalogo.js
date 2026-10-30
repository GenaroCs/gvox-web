import { juegos, escapar, precioCompra, soles, detalleDe } from '../core/datos.js';
import { iniciar } from '../components/estructura.js';
import { tarjetaJuego, vacio } from '../components/fabrica.js';
import { obtenerEstado } from '../core/estado.js';
import { icono } from '../components/iconos.js';
iniciar('catalogo');
const formulario = document.getElementById('filtros');
const busqueda = document.getElementById('busqueda');
const normalizar = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
document.getElementById('busqueda-campo').insertAdjacentHTML('afterbegin', icono('buscar'));
for (const [id, propiedad] of [['genero', 'genero'], ['categoria', 'coleccion']]) {
  document.getElementById(id).insertAdjacentHTML('beforeend', [...new Set(juegos.map(juego => juego[propiedad]))].sort().map(valor => `<option value="${escapar(valor)}">${escapar(valor)}</option>`).join(''));
}
formulario.elements.favoritos.checked = new URLSearchParams(location.search).has('favoritos');
formulario.insertAdjacentHTML('beforeend', `<label class="campo">PRECIO MÍNIMO EN SOLES<input name="minimo" type="number" min="0" max="250" value="0" step="5"></label><label class="campo">CARACTERÍSTICAS<select name="caracteristica"><option value="">Cualquier soporte</option>${[...new Set(Object.values(juegos).flatMap(juego => detalleDe(juego.id).caracteristicas))].sort().map(valor => `<option>${escapar(valor)}</option>`).join('')}</select></label>`);
function mostrar() {
  const filtros = new FormData(formulario);
  const maximo = Number(filtros.get('precio')) * 100;
  const favoritos = obtenerEstado().favoritos;
  let seleccion = juegos.filter(juego => normalizar(`${juego.nombre} ${juego.desarrollador} ${juego.editor}`).includes(normalizar(busqueda.value.trim()))
    && (!filtros.get('genero') || juego.genero === filtros.get('genero'))
    && (!filtros.get('coleccion') || juego.coleccion === filtros.get('coleccion'))
    && precioCompra(juego) <= maximo && precioCompra(juego) >= Number(filtros.get('minimo') || 0) * 100
    && (!filtros.get('caracteristica') || detalleDe(juego.id).caracteristicas.includes(filtros.get('caracteristica')))
    && (!filtros.has('ofertas') || detalleDe(juego.id).oferta)
    && (!filtros.has('favoritos') || favoritos.includes(juego.id)));
  const orden = document.getElementById('orden').value;
  seleccion.sort((a, b) => orden === 'menor' ? precioCompra(a) - precioCompra(b) : orden === 'mayor' ? precioCompra(b) - precioCompra(a) : orden === 'nombre' ? a.nombre.localeCompare(b.nombre, 'es') : Number(b.destacado) - Number(a.destacado));
  document.getElementById('precio-etiqueta').textContent = soles(maximo);
  document.querySelector('.cabecera-pagina h1').innerHTML = filtros.has('favoritos') ? 'Mis favoritos<span class="lima">.</span>' : 'Tu próximo juego está aquí<span class="lima">.</span>';
  document.getElementById('resultados').textContent = `${seleccion.length} DE ${juegos.length} JUEGOS`;
  document.getElementById('juegos-catalogo').innerHTML = seleccion.length ? seleccion.map(juego => tarjetaJuego(juego, { vertical: true })).join('') : vacio('No encontramos esa aventura.', 'Prueba otro nombre o limpia los filtros.', null);
}
formulario.addEventListener('input', mostrar);
formulario.addEventListener('submit', evento => evento.preventDefault());
busqueda.addEventListener('input', mostrar);
document.getElementById('orden').addEventListener('change', mostrar);
document.getElementById('limpiar-filtros').onclick = () => { formulario.reset(); busqueda.value = ''; document.getElementById('orden').value = 'destacados'; mostrar(); };
window.addEventListener('gvox:cambio', mostrar);
mostrar();
