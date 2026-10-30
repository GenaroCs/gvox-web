# Verificación de Etapa 1

Realizada el 29 de octubre de 2026 con Node.js v24.21.0 y el navegador integrado basado en Chromium. No se instalaron dependencias.

## Pantallas y recursos

- Las ocho páginas se abrieron a **1440 × 900** y **1920 × 1080**: 16 comprobaciones sin desbordamiento horizontal y sin imágenes rotas detectadas. Se guardaron capturas y se inspeccionaron las dos vistas generales.
- Las ocho páginas mostraron cero elementos visibles a **1023 × 900** y **390 × 844**: pantalla negra en las 16 comprobaciones. Se corrigió la sensibilidad a fracciones de píxel en el límite de 1023.
- Sin errores ni advertencias de aplicación capturados en la consola durante los recorridos.
- Las referencias estáticas de los ocho HTML apuntan a archivos existentes; las ocho entradas JS y sus módulos pasan la comprobación de sintaxis de Node.
- Se verificaron rutas, huellas, dimensiones y decodificación completa de los **173 WebP**. Los 188 archivos gráficos finales no contienen duplicados binarios.
- Integridad: los **119 archivos recibidos** y los **161 originales descargados** conservan sus SHA-256; no se modificó material original durante Etapa 1.

Registros: `revision-paginas.json`, `revision-movil.json` y `verificacion-recursos.json`, en `registros/etapa1/`. Capturas individuales y vistas generales están en la misma carpeta.

## Recorridos comprobados en navegador

| Operación | Resultado observado |
|---|---|
| Registro y acceso | Correo mal formado rechazado; registro con nombre/correo válido; `abc` rechazado como código y `0` aceptado. |
| Recuperación | El flujo indica que no envía correo, acepta un código numérico y permite continuar a la biblioteca. |
| Búsqueda y filtros | SEGA encuentra 3 títulos; texto inexistente encuentra 0; multijugador más ofertas encuentra 2. |
| Favoritos | Añadir Tales of ARISE cambia la vista a 3 favoritos y se conserva al navegar. |
| Galería y requisitos | Cambiar miniatura cambia la captura principal del mismo juego; mínimos y recomendados visibles. |
| Alquiler y pago | Metaphor por 48 h: S/ 17,90, comprobante local y licencia con exactamente 48 h desde el pago. |
| Conversión | Carrito de S/ 179,90 menos S/ 17,90 = S/ 162,00. Tras pagar, licencia permanente sin temporizador. |
| Saldo insuficiente | El pago de Cyberpunk por S/ 169,92 fue rechazado con saldo S/ 60,10. No apareció licencia del juego. |
| Reembolso | Devolver la compra convertida acreditó S/ 179,90: el saldo pasó de S/ 60,10 a S/ 240,00. |
| Recarga | S/ 240,00 + recarga ficticia de S/ 50 = S/ 290,00, reflejado en saldo e historial. |
| Colecciones | Crear, asignar Metaphor, filtrar, renombrar y recargar conservó la colección y su nombre. |
| Reseña | Recomendación negativa y texto se publicaron en la ficha con licencia de demostración. |
| Perfil | Nombre, biografía y avatar se actualizaron; solo amigos ocultó el perfil a visitante y lo mostró al amigo de muestra; actividad desactivada. |
| Comunidad | Aceptar a Noa actualizó la lista; bloquear a Mika retiró sus publicaciones; publicar una captura de Elden Ring la mostró con el juego correcto. |
| Cuenta/restablecimiento | Otra cuenta recibió su estado de ejemplo separado. Restablecer recuperó la demo inicial. |

## Reglas de negocio

`node scripts/comprobar_flujos.mjs` completó **22 recorridos y condiciones** con los servicios de la aplicación y almacenamiento temporal en memoria. Entre ellos:

- Compra vacía y total cero rechazados.
- Licencias de 48 y 72 horas calculadas desde el pago.
- Fallo de pago sin cambios de saldo, carrito, licencias ni comprobantes.
- Tres estrategias de pago y recargas con límites.
- Conversión con descuento íntegro y sin duplicar licencia.
- Conversión que vence antes del pago rechazada sin cobrar.
- Ejecución y reseña rechazadas sin licencia vigente.
- Reembolso único y límites estrictos: exactamente 14 días o 120 minutos no son elegibles.
- Colecciones con varios juegos, edición y eliminación sin perder licencias.
- Amistades y bloqueo coherentes, niveles de privacidad y separación de cuentas locales.

El avance de reloj de estas pruebas ocurre solo en el proceso de prueba; no cambia la fecha del equipo ni los datos del navegador. Registro detallado en `pruebas-servicios.json`.

## Peso de portada

El grafo estático de la portada, incluidos HTML, módulos importados, CSS, cinco JSON y todas sus imágenes, suma **717 636 bytes (0,72 MB)**; las imágenes suman **540 030 bytes**. Con 600 000 bytes de margen: **1 317 636 bytes (1,32 MB)**, por debajo del objetivo aproximado de 3 MB.

Es un presupuesto calculado desde los archivos, sin cabeceras HTTP ni medición de red. Incluye imágenes que usan lazy loading. No se certifica el tiempo de respuesta inferior a 2 segundos en otros equipos o redes. Detalle en `presupuesto-portada.json`.

## Límites pendientes

No hay videos locales; Stardew Valley no publica requisitos recomendados en la instantánea oficial consultada. El comprobante se comprobó en pantalla e historial; su descarga de texto no se automatizó en el navegador. No se probó una matriz de navegadores ajenos a Chromium.

Autenticación, correo, pagos, privacidad, licencias y DRM son demostraciones locales; no cumplen técnicamente los servicios de backend del documento. Se conservan esos límites en la matriz de 23 RFU y 25 HU. No se detectaron bloqueos en los flujos principales comprobados.
