"""Preparación local de contenido y HTML; no descarga ni modifica materiales originales."""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def write_json(name, data):
    (ROOT / 'data' / f'{name}.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def prepare():
    resources = read(ROOT / 'data/recursos.json')['recursos']
    source = read(ROOT / 'herramientas/descargas/04/galerias_descargadas.json')
    write_json('imagenes', {e['ruta']: {k: e[k] for k in ('ancho', 'alto') if k in e} for e in resources})
    offers = {'persona-5-royal': 20, 'tales-of-arise': 25, 'cyberpunk-2077': 15, 'code-vein': 30, 'stardew-valley': 10}
    details = {}
    for entry in source:
        metadata = entry['datos']
        requirements = []
        for line in re.findall(r'<li>(.*?)</li>', metadata.get('requisitos_pc', ''), re.S):
            text = html.unescape(re.sub(r'<[^>]+>', ' ', line))
            text = re.sub(r'\s+', ' ', text).strip()
            if ':' in text:
                name, value = text.split(':', 1)
                labels = {'SO': 'Sistema operativo', 'OS': 'Sistema operativo', 'Procesador': 'Procesador', 'Processor': 'Procesador', 'Memoria': 'Memoria', 'Memory': 'Memoria', 'Gráficos': 'Gráficos', 'Graphics': 'Gráficos', 'Almacenamiento': 'Almacenamiento', 'Storage': 'Almacenamiento'}
                if name.strip() in labels:
                    value = value.strip().replace(' or ', ' o ').replace(' and ', ' y ').replace(' GB RAM', ' GB de RAM').replace(' GB available space', ' GB disponibles')
                    requirements.append({'nombre': labels[name.strip()], 'valor': value})
        description = html.unescape(re.sub(r'<[^>]+>', '', metadata.get('descripcion', '')))
        if not description or description.startswith(('The ', 'A ', 'You ', 'Explore ', 'Discover ')):
            description = f"Descubre {entry['nombre']}. Explora su galería y elige cómo vivir tu próxima aventura: compra permanente o alquiler de demostración por 48 o 72 horas."
        details[entry['slug']] = {'descripcion': description, 'estreno': metadata.get('estreno', ''), 'oferta': offers.get(entry['slug'], 0), 'generos': metadata.get('generos', []), 'requisitos': requirements}
    write_json('juegos-detalles', details)
    asset = {e['id']: e['ruta'] for e in resources}
    users = []
    for index, name in enumerate(['Kairo', 'Mika', 'Ren', 'Sora', 'Noa', 'Akari', 'Nero', 'Lyra']):
        key = name.lower()
        users.append({'id': key, 'nombre': name, 'avatar': f'avatar_{key}', 'rutaAvatar': asset[f'avatar_{key}'], 'conectado': index % 3 != 2,
                      'licencias': [['persona-3-reload'], ['metaphor-refantazio'], ['persona-5-royal'], ['tales-of-arise'], ['scarlet-nexus'], ['code-vein'], ['nier-automata'], ['hades-ii']][index]})
    write_json('demo', {'usuarios': users,
        'publicaciones': [
            {'id': 'post-mika', 'usuarioId': 'mika', 'juegoId': 'metaphor-refantazio', 'texto': 'Ese momento en el que dejas de seguir la misión y te quedas mirando el escenario. ¿También les pasa? ✦', 'imagenId': 'post_01'},
            {'id': 'post-ren', 'usuarioId': 'ren', 'juegoId': 'persona-3-reload', 'texto': 'Hoy toca una partida tranquila. Música, auriculares y una nueva historia por descubrir.', 'imagenId': 'post_02'},
            {'id': 'post-lyra', 'usuarioId': 'lyra', 'juegoId': 'hades-ii', 'texto': 'Una partida más nunca es una sola partida. Dejando mi captura favorita de la sesión.', 'imagenId': 'post_03'}],
        'resenas': [
            {'id': 'resena-mika', 'usuarioId': 'mika', 'juegoId': 'metaphor-refantazio', 'puntuacion': 5, 'texto': 'La dirección artística me atrapó desde el principio. Es de esas aventuras que disfruto sin mirar el reloj.', 'verificada': True},
            {'id': 'resena-ren', 'usuarioId': 'ren', 'juegoId': 'persona-5-royal', 'puntuacion': 5, 'texto': 'Una de mis elecciones para desconectar. La presentación tiene muchísima personalidad.', 'verificada': True},
            {'id': 'resena-lyra', 'usuarioId': 'lyra', 'juegoId': 'hades-ii', 'puntuacion': 4, 'texto': 'Perfecto para una sesión corta que termina durando bastante más. Me alegra haberle dado una oportunidad.', 'verificada': True}],
        'recursos': {key: value for key, value in asset.items() if key.startswith(('avatar_', 'banner_', 'post_', 'actividad_'))}})

    pages = {
        'inicio': ('Inicio', 'index.html', '''
<section class="hero" aria-labelledby="titulo-inicio">
  <img class="hero-imagen" src="assets/img/portada/metaphor-refantazio/hero-principal-metaphor.webp" width="1600" height="517" alt="Arte oficial de Metaphor: ReFantazio" fetchpriority="high" loading="eager" decoding="async">
  <div class="hero-sombra"></div><div class="hero-contenido"><span class="ceja">GVOX PRESENTA / OTRA FORMA DE JUGAR</span><h1 id="titulo-inicio">PRIMERO<br><span>JUÉGALO.</span><br>LUEGO DECIDE.</h1><p>Tu próxima gran historia empieza aquí. Alquila por 48 o 72 horas y descuenta el <strong>100 % de tu alquiler</strong> al comprar.</p><div class="acciones-en-linea"><a class="boton primario" href="pages/catalogo.html">DESCUBRIR JUEGOS ↗</a><a class="boton secundario" href="#como-funciona">CÓMO FUNCIONA</a></div><div class="hero-pie"><span class="punto"></span> PARA QUIENES JUEGAN A SU MANERA</div></div>
  <a class="hero-juego" href="pages/ficha.html?juego=metaphor-refantazio"><span>EL PROTAGONISTA DE HOY</span><strong>Metaphor: ReFantazio</strong><small>ATLUS · Anime / JRPG ↗</small></a><div class="hero-horas"><span>UNA NUEVA FORMA DE DESCUBRIR</span><strong>48H <i>/</i> 72H</strong><small>TU JUEGO. TU TIEMPO.</small></div>
</section>
<section class="franja-valor" id="como-funciona" aria-label="Cómo funciona el alquiler"><div><b>01</b><span>ELIGE TU AVENTURA<small>20 juegos reales por descubrir</small></span></div><div><b>02</b><span>JUÉGALO A TU RITMO<small>Alquila durante 48 o 72 horas</small></span></div><div><b>03</b><span>QUÉDATE CON ÉL<small>Descontamos el alquiler al comprar</small></span></div><div class="franja-demo"><strong>100 %</strong><span>DEL ALQUILER<br>SE CONVIERTE EN DESCUENTO</span></div></section>
<section class="seccion radar"><div class="cabecera-seccion"><div><span class="ceja">SELECCIONADOS PARA TI</span><h2>EN NUESTRO RADAR <span class="lima">↗</span></h2></div><a class="enlace-lima" href="pages/catalogo.html">VER TODOS LOS JUEGOS →</a></div><div id="recomendados" class="rejilla-juegos rejilla-cinco"></div></section>
<section class="seccion"><div class="cabecera-seccion"><div><span class="ceja">MÁS HISTORIAS, MENOS EXCUSAS</span><h2>Tu siguiente descubrimiento.</h2></div><span class="pequeno muted">Ofertas e importes de demostración</span></div><div id="promociones" class="promociones"></div></section>
<section class="llamada-final"><div><span class="ceja">SIN PRISA. SIN QUEDARTE CON LAS GANAS.</span><h2>La mejor forma de elegir<br>es <span class="lima">haberlo jugado.</span></h2></div><a class="boton primario" href="pages/catalogo.html">ENCONTRAR MI PRÓXIMO JUEGO ↗</a></section>
'''),
        'catalogo': ('Catálogo', 'pages/catalogo.html', '''
<div class="cabecera-pagina entre"><div><span class="ceja">ELIGE TU PRÓXIMO MUNDO</span><h1>Tu próximo juego está aquí<span class="lima">.</span></h1><p class="muted pequeno">Grandes historias, nuevas obsesiones. Encuentra la tuya.</p></div><a class="enlace-lima" href="biblioteca.html">MI BIBLIOTECA ↗</a></div>
<div class="catalogo-estructura"><aside class="filtros panel panel-interior"><div class="entre"><strong class="micro">FILTRAR</strong><button type="button" class="enlace-texto" id="limpiar-filtros">Limpiar</button></div><div class="separador"></div><form id="filtros" class="formulario"><label class="campo">GÉNERO<select name="genero" id="genero"><option value="">Todos los géneros</option></select></label><label class="campo">COLECCIÓN<select name="coleccion" id="categoria"><option value="">Todas las colecciones</option></select></label><label class="campo">PRECIO MÁXIMO <span id="precio-etiqueta"></span><input name="precio" type="range" min="0" max="250" value="250" step="5" aria-label="Precio máximo en soles"></label><label class="check-linea"><input name="ofertas" type="checkbox"> Solo ofertas</label><label class="check-linea"><input name="favoritos" type="checkbox"> Mis favoritos</label></form><div class="filtros-nota"><span class="ceja">PRIMERO, JUÉGALO.</span><strong>48 o 72 horas<br>para decidir.</strong><p>Al comprar, descontamos el 100 % del alquiler activo.</p></div></aside><section><div class="catalogo-barra"><label class="buscador" id="busqueda-campo"><span class="solo-lectores">Buscar videojuego</span><input class="entrada" id="busqueda" type="search" placeholder="Buscar tu próximo juego…"></label><label class="campo ordenar">ORDENAR POR<select id="orden"><option value="destacados">Seleccionados por Gvox</option><option value="menor">Menor precio</option><option value="mayor">Mayor precio</option><option value="nombre">Nombre A–Z</option></select></label></div><div class="catalogo-banner"><div><span class="ceja">COMPRA O ALQUILA · TÚ ELIGES</span><strong>LA AVENTURA TE ESPERA.</strong></div><span class="insignia">48 H / 72 H</span></div><div class="entre catalogo-conteo"><span id="resultados" class="micro muted" aria-live="polite"></span><span class="micro muted">PRECIOS SIMULADOS · SOLES</span></div><div class="rejilla-juegos" id="juegos-catalogo"></div></section></div>
'''),
        'ficha': ('Ficha de videojuego', 'pages/ficha.html', '<div id="detalle-juego"><p class="carga">Preparando tu próxima aventura…</p></div>'),
        'carrito': ('Carrito y pago', 'pages/carrito.html', '''<div class="cabecera-pagina"><span class="ceja">TU PRÓXIMA AVENTURA, A UN CLIC</span><h1>Todo listo para jugar<span class="lima">.</span></h1><p class="pequeno muted">Elige cómo quieres vivir cada historia. Nosotros guardamos tu selección.</p></div><div id="checkout"></div>'''),
        'acceso': ('Acceso y registro', 'pages/acceso.html', '''
<section class="acceso-escena"><div class="acceso-arte"><img src="../assets/img/galerias/persona-3-reload/captura_01.webp" width="1600" height="900" alt="Captura oficial de Persona 3 Reload" fetchpriority="high"><div class="acceso-sombra"></div><div class="acceso-texto"><span class="ceja">TU PRÓXIMA HISTORIA EMPIEZA AQUÍ</span><h1>UNA COMUNIDAD<br>QUE NUNCA<br><span class="lima">SE DETIENE.</span></h1><p>Descubre, juega y comparte. Tu biblioteca, tus amigos y tu próxima aventura en un solo lugar.</p><span class="insignia">PERSONA 3 RELOAD · ATLUS</span></div></div><div class="acceso-formulario"><div class="acceso-caja"><span class="ceja">BIENVENIDO A GVOX</span><h2>Entra al juego<span class="lima">.</span></h2><p class="muted pequeno" id="acceso-ayuda">Tu biblioteca, tus amigos y una nueva historia te esperan.</p><div class="pestanas" role="tablist" aria-label="Tipo de acceso"><button type="button" role="tab" aria-selected="true" data-modo="login">Iniciar sesión</button><button type="button" role="tab" aria-selected="false" data-modo="registro">Crear cuenta</button></div><form id="form-acceso" class="formulario"><label class="campo oculto" id="campo-nombre">TU NOMBRE<input id="nombre" maxlength="30" autocomplete="nickname" placeholder="¿Cómo te llamamos?"></label><label class="campo">CORREO ELECTRÓNICO<input id="correo" type="email" required maxlength="120" autocomplete="email" placeholder="nombre@correo.com"></label><button class="boton primario bloque" type="submit" id="continuar-acceso">CONTINUAR ↗</button></form><button class="enlace-texto recuperar" id="recuperar" type="button">¿Necesitas recuperar tu acceso?</button><form id="form-codigo" class="formulario oculto"><div class="codigo-nota"><span class="insignia">VERIFICACIÓN DE DEMOSTRACIÓN</span><p id="codigo-ayuda">No enviamos correos. Escribe cualquier código numérico para continuar.</p></div><label class="campo">TU CÓDIGO<input id="codigo" type="text" inputmode="numeric" pattern="[0-9]+" required autocomplete="one-time-code" placeholder="Por ejemplo, 123456" maxlength="30"></label><button class="boton primario bloque" type="submit">ENTRAR A MI BIBLIOTECA ↗</button><button class="enlace-texto" id="cambiar-correo" type="button">Usar otro correo</button></form><div class="nota-simulacion" id="nota-acceso">◇ Demo académica. Cualquier correo válido y código numérico sirven. No se solicitan contraseñas.</div><button type="button" class="boton secundario bloque cuenta-prueba" id="cuenta-prueba">USAR CORREO DE PRUEBA</button></div></div></section>
'''),
        'biblioteca': ('Mi biblioteca', 'pages/biblioteca.html', '''<div class="cabecera-pagina entre"><div><span class="ceja">TU ESPACIO DE JUEGO</span><h1>Mi biblioteca<span class="lima">.</span></h1></div><button type="button" id="nueva-coleccion" class="boton secundario">+ NUEVA COLECCIÓN</button></div><div class="portal"><div id="lateral"></div><section><div class="biblioteca-banner"><span class="ceja">LAS HISTORIAS QUE ELIGES SE QUEDAN CONTIGO</span><h2>JUEGA HOY. DECIDE DESPUÉS.</h2><p class="pequeno muted">Tu tiempo, tus mundos. Todo está aquí.</p></div><div id="filtros-biblioteca" class="pestanas" role="tablist" aria-label="Filtrar biblioteca"></div><div id="coleccion-activa"></div><div id="juegos-biblioteca" class="biblioteca-rejilla"></div><div class="biblioteca-notas"><div class="panel panel-interior"><span class="ceja">LICENCIAS DE DEMOSTRACIÓN</span><h3>Acceso según tu licencia.</h3><p class="muted pequeno">El botón de juego añade 15 minutos ficticios de uso. Los alquileres vencidos no permiten iniciar la simulación.</p></div><div class="panel panel-interior"><span class="ceja">CAMBIAR DE OPINIÓN ESTÁ BIEN</span><h3>Reembolsos con reglas claras.</h3><p class="muted pequeno">Menos de 14 días desde la adquisición y menos de 2 horas de uso. El importe vuelve al monedero ficticio.</p></div></div></section></div>'''),
        'comunidad': ('Comunidad', 'pages/comunidad.html', '''<div class="cabecera-pagina entre"><div><span class="ceja">UN BUEN JUEGO SE DISFRUTA MÁS EN COMPAÑÍA</span><h1>Jugar es mejor juntos<span class="lima">.</span></h1></div><button type="button" id="nueva-publicacion" class="boton primario">+ COMPARTIR MOMENTO</button></div><div class="portal"><div id="lateral"></div><section><div class="comunidad-columnas"><div><div id="pestanas-comunidad" class="pestanas" role="tablist" aria-label="Comunidad"><button role="tab" aria-selected="true" data-vista="feed">Tu comunidad</button><button role="tab" aria-selected="false" data-vista="resenas">Reseñas verificadas</button></div><div id="feed"></div></div><aside id="amigos" class="apilado"></aside></div></section></div>'''),
        'perfil-monedero': ('Perfil y monedero', 'pages/perfil-monedero.html', '''<div class="cabecera-pagina"><span class="ceja">TU ESPACIO, A TU MANERA</span><h1>Mi perfil y monedero<span class="lima">.</span></h1></div><div class="portal"><div id="lateral"></div><section id="perfil-contenido"></section></div>'''),
    }
    for key, (title, filename, content) in pages.items():
        prefix = '' if key == 'inicio' else '../'
        main_class = 'contenedor inicio' if key == 'inicio' else 'acceso-main' if key == 'acceso' else 'contenedor'
        document = f'''<!doctype html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#090d0d"><meta name="description" content="Gvox: descubre videojuegos reales, explora tu biblioteca y prueba el alquiler de 48 o 72 horas en un prototipo académico."><title>{title} · GVOX</title><link rel="icon" href="{prefix}assets/img/branding/logos/gvox-favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="{prefix}assets/css/global.css"><link rel="stylesheet" href="{prefix}assets/css/pages/{key}.css"></head>
<body data-pagina="{key}"><header id="cabecera" class="cabecera"></header><main class="{main_class}">{content}</main><footer id="pie" class="pie"></footer><noscript>Activa JavaScript para explorar esta demostración de Gvox.</noscript><script type="module" src="{prefix}assets/js/pages/{key}.js"></script></body></html>'''
        (ROOT / filename).write_text(document, encoding='utf-8')
    print('Datos locales y ocho páginas HTML preparados.')


if __name__ == '__main__':
    if (ROOT / 'index.html').exists():
        raise SystemExit('El prototipo ya está implementado. No sobrescribir con la preparación inicial.')
    prepare()
