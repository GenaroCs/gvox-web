# Arquitectura · Etapa 1

Ocho HTML independientes: `index.html` y siete archivos en `pages/`. Cada uno carga una hoja de sección y una entrada ES6 con el mismo nombre en `assets/css/pages/` y `assets/js/pages/`: inicio, catalogo, ficha, carrito, acceso, biblioteca, comunidad y perfil-monedero.

## Responsabilidades

- `core/datos.js`: JSON local, rutas, importes en centavos y fechas de Lima. Los slugs de Etapa 0 identifican los juegos.
- `core/estado.js`: almacenamiento por correo, sesión por pestaña, ejemplos y restablecimiento. Cada cambio se aplica sobre una copia: se guarda solo si la operación termina sin error.
- `components/fabrica.js`: Factory mediante funciones para tarjetas, imágenes, avatares y estados vacíos. Sin jerarquías de clases.
- `components/estructura.js`: cabecera, pie, navegación y barra lateral. Otros componentes comparten iconos, diálogos, avisos, reseñas y comprobantes.
- `services/`: reglas de carrito, biblioteca, reembolsos, colecciones, pagos, perfil y comunidad.
- `strategies/payment/`: Strategy para monedero, tarjeta ficticia y pago móvil ficticio. El monedero valida y descuenta el saldo; los externos representan aprobación de prueba sin contactar proveedores.
- `pages/`: interacción y composición de cada pantalla; los servicios no conocen su HTML.
- `assets/css/global.css`: base y componentes comunes. Las hojas por pantalla contienen sus composiciones.
- `scripts/servidor.mjs`: servidor estático de localhost; sin base de datos, endpoints de negocio ni dependencias.

## Reglas compartidas

Las operaciones de pago guardan comprobante, movimiento y licencia y vacían el carrito. Si fallan, no se escribe el estado. El alquiler vence a la hora del pago más 48 o 72 horas. El contador se actualiza cada segundo; Jugar vuelve a validar vigencia y solo añade 15 minutos ficticios, sin ejecutar software.

La conversión descuenta todo el alquiler activo y transforma la misma licencia en permanente. Conserva fecha y uso para no reiniciar las condiciones de reembolso. Si vence antes del checkout, la conversión se rechaza; la compra ordinaria sin descuento sigue disponible. El reembolso exige menos de 14 días y menos de 120 minutos, sin un reembolso previo, y devuelve lo pagado al monedero ficticio.

Las colecciones permiten crear, renombrar, asignar múltiples juegos y eliminar la agrupación. Las reseñas requieren sesión y licencia vigente antes del formulario y al guardar; usan recomendación positiva o negativa. El bloqueo retira el contacto y sus publicaciones. La privacidad ofrece público, solo amigos y privado, con vista de visitante ilustrativa.

Cada correo válido selecciona una cuenta local, sin probar identidad ni proteger sus datos. No se guardan contraseñas. sessionStorage conserva la sesión; localStorage contiene la demo. No se afirma cumplimiento de seguridad, backend, DRM, pagos ni correo real.

## Identidad y recursos

Composición del paquete 06, marca del 01, grafito, lima #D5FF51 y cálido #FFA37D. Arial, Helvetica y sans-serif del sistema, sin descargar fuentes. La regla móvil usa `width < 1024px`, cubriendo 1023 px y las fracciones de píxel del navegador.

Se reutilizan los WebP de Etapa 0; no se descargaron imágenes nuevas ni se utilizó IA. Solo se consultaron metadatos oficiales para completar descripciones, etiquetas de soporte y requisitos, guardándolos localmente. La aplicación no llama a Steam. Los datos de las fuentes y el contenido se escapan antes de insertarlos en HTML.

Los originales permanecen intactos. El PDF completo, páginas 36–51, contiene las 25 HU detalladas; no se confunden con las doce del backlog resumido. La correspondencia está en COBERTURA_REQUISITOS.md.
