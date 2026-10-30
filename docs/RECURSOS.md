# Recursos: fuentes, versiones y carga

## Inventarios

- `registros/copias-originales.json`: procedencia del escritorio y SHA-256 de los 119 archivos recibidos.
- `registros/inventario-originales.json`: inventario inicial de esos archivos, antes de las descargas.
- `registros/validacion-imagenes-originales.json`: 49 imágenes recibidas, incluidas referencias conceptuales y capturas que no se usarán como contenido del sitio.
- `registros/originales-descargados.json`: originales de Internet archivados posteriormente, sin compresión, con sus huellas y fuentes. Se añaden sin sobrescribir archivos recibidos.
- `registros/recursos-antes-optimizacion.json`: relación previa a WebP, incluyendo los alias sin duplicar archivo.
- `../data/recursos.json`: rutas finales, dimensiones reales, formato, tamaño, uso, juego, URL de procedencia y original conservado.
- `registros/optimizacion.json`: bytes antes y después y perfiles utilizados.

Los veinte juegos del catálogo mantienen sus identificadores originales. Los nombres ficticios Aetherfall, Void Echo y otros del paquete 06 no se migraron al catálogo ni se asociaron a imágenes reales. Sus ilustraciones y las capturas de las maquetas quedan únicamente en material original.

## Descarga

Se revisaron los cuatro MJS, sus JSON y las direcciones antes de ejecutarlos. Se copiaron solo scripts, JSON y CSV necesarios a `herramientas/descargas/02` a `05`, sin ejecutar los BAT. Usan Node.js nativo, imágenes de CDN Steam y consultas públicas de metadatos para localizar las capturas auténticas. Esas consultas solo se hacen durante la preparación; no forman parte de la aplicación prevista.

El primer intento de galerías rechazó seis fondos PNG que el servidor anunciaba como `image/jpeg`. Se conserva el registro inicial. Solo la copia `04/descargar_galerias.mjs` se ajustó para determinar el formato por firma binaria; el segundo intento recuperó los ocho fondos con su extensión real. No hubo sustituciones por otro juego.

Los registros del descargador conservan sus rutas de trabajo históricas. Los binarios temporales se consolidaron y retiraron de `herramientas`; las rutas vigentes son las del inventario final y sus originales archivados. No usar las rutas antiguas de los logs desde HTML.

`node scripts/descargar_recursos.mjs` vuelve a descargar los paquetes y puede recrear archivos temporales. No se necesita repetirlo para la Etapa 1. La copia corregida del 04 se conserva. Los scripts Python de consolidación y optimización se detienen si ya existe su resultado, para impedir sobrescrituras accidentales. El script de preparación fue ejecutado sobre el proyecto vacío y no debe usarse para reemplazar el inventario inicial después de la entrega.

## Optimización

Todas las imágenes ráster de contenido se entregan en WebP con calidad 88 y método 6; los logotipos ráster se codifican sin pérdida. Los límites mantienen la proporción original y nunca amplían una imagen pequeña. SVG continúa como vector e ICO conserva su función de favicon; no ganan calidad al convertirlos a WebP.

| Uso | Límite de ancho × alto |
|---|---|
| Portada vertical de juego | 600 × 900 |
| Cabecera de catálogo | 920 × 430 |
| Tarjeta horizontal | 800 × 460 |
| Hero y banners | 1600 × 900 |
| Imagen lateral de acceso | 900 × 1200 |
| Captura de galería | 1600 × 1000 |
| Publicación de comunidad | 1200 × 800 |
| Avatar | 256 × 256 |
| Miniatura de actividad | 320 × 180 |
| Marca ráster | 800 × 400 |

Los límites son cajas de contención, no recortes. La futura interfaz elegirá `object-fit` y `object-position` según el wireframe. Una imagen usada a dos tamaños puede tener dos derivados justificados; los archivos idénticos se comparten por SHA-256. Las referencias de login pueden utilizar el mismo original que una portada con un derivado apropiado para cada uso.

Pillow ya estaba disponible en el runtime integrado; no se instaló ninguna biblioteca. Verificación: firma y tipo durante la descarga, `verify()` y decodificación completa del original y del WebP, dimensiones y huellas. Los SVG se analizaron como XML sin scripts.

## Lazy loading y portada

El inventario entrega `ancho`, `alto`, `loading`, `decoding` y `fetchpriority` para incorporar los atributos HTML en Etapa 1. Reservar el espacio con `width` y `height`; usar `loading="lazy"` y `decoding="async"` para imágenes fuera de la primera vista. Marcar solo el hero visible como `loading="eager"` y `fetchpriority="high"`. Ajustar las primeras tarjetas visibles a la composición real al implementarlas. No activar precarga de héroes alternativos.

El presupuesto de `data/portada-presupuesto.json` incluye el hero principal de Metaphor, cinco tarjetas destacadas, tres promociones, marca y favicon, sin contar dos veces una ruta compartida. Reserva además 600 000 bytes para HTML, CSS, JS y otros recursos. Es una previsión conservadora, no una medición de red de una página que todavía no existe. Medir la carga en frío con caché desactivada en Etapa 1 y mantenerla cerca de 3 000 000 bytes o menos.

El tamaño de ahorro compara originales únicos que sí se utilizarán frente a todos sus derivados finales, incluidos los distintos tamaños necesarios. Las capturas de referencia y el arte conceptual ajenos a la aplicación se informan aparte y no inflan ese ahorro.
