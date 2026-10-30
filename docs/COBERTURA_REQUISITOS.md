# Cobertura de requisitos e historias de usuario

29 de octubre de 2026. La verificación de una simulación no acredita cumplimiento técnico de servicios reales.

Fuente principal: [documento completo de 52 páginas](../../00_MATERIAL_ORIGINAL/GVOX_REQUISITOS_ORIGINALES.pdf), RFU en páginas 15–17 e historias detalladas en páginas 36–51. La exposición y el Product Backlog resumen doce historias con numeración distinta: no sustituyen las veinticinco detalladas. Las extracciones de consulta están en `fuentes/`.

**UI** indica recorrido comprobado en navegador. **Servicios** indica recorrido con las funciones reales y almacenamiento temporal en memoria. **Parcial** identifica criterios no reproducidos íntegramente. Los resultados y límites están en `VERIFICACION_ETAPA_1.md` y `registros/etapa1/`.

## Los 23 requisitos funcionales

| RFU · HU detallada | Pantalla | Comportamiento implementado | Verificación | Limitación de la simulación |
|---|---|---|---|---|
| RFU-001 · HU01 | Acceso | Nombre/correo, registro local y paso de código. | UI; parcial. | Sin unicidad central, fecha de nacimiento, contraseña ni Bcrypt; cualquier correo válido debe poder entrar. |
| RFU-002 · HU02 | Acceso | Sesión por pestaña, entrada y salida; cuentas locales por correo. | UI + servicios; parcial. | Sin contraseña, token de seguridad ni base de datos. |
| RFU-003 · HU03 | Acceso | Paso numérico separado; texto rechazado y cualquier número aceptado. | UI. | Sin reconocimiento de IP/dispositivo, correo ni segundo factor auténtico. |
| RFU-004 · HU04 | Acceso | Recuperación ficticia por correo y paso numérico. | UI; parcial. | Sin enlace, token temporal ni cambio de contraseña real. |
| RFU-005 · HU05 | Perfil | Avatar, biografía y privacidad pública/amigos/privada; vista de visitante. | UI + servicios. | Preferencias locales, sin protección de servidor. |
| RFU-006 · HU06 | Inicio, catálogo | Veinte juegos, destacados, banners, precios y ofertas coherentes. | UI a 1440 y 1920 px. | Ofertas ficticias; SLA de menos de 2 s no certificado. |
| RFU-007 · HU07 | Catálogo | Busca título, desarrollador o editor y muestra cero coincidencias sin error. | UI. | Búsqueda sobre JSON local. |
| RFU-008 · HU08 | Catálogo | Género, colección, precios mínimo/máximo, soporte, ofertas y favoritos acumulativos. | UI. | Etiquetas oficiales guardadas; sin actualización en vivo. |
| RFU-009 · HU09 | Ficha | Descripción, galería ampliable, mínimos/recomendados y reseñas. | UI; parcial. | Sin videos locales; un título no publica recomendados. |
| RFU-010 · HU10 | Favoritos, ficha | Añadir/quitar, vista de favoritos, orden/filtros y persistencia por correo. | UI + servicios. | Sin alertas por correo ni cuenta protegida de servidor. |
| RFU-011 · HU11 | Carrito | Añadir, cambiar modalidad, eliminar, sumar ofertas y bloquear pago vacío/cero. | UI + servicios. | Sin DLC de ejemplo; solo juegos. |
| RFU-012 · HU12 | Carrito | Tres estrategias; saldo suficiente en monedero; estado Pagado y licencias. | UI + servicios. | Tarjeta y móvil representan aprobación ficticia, sin comprobar fondos externos. |
| RFU-013 · HU13 | Carrito, perfil | Comprobante automático detallado, historial y descarga de texto. | UI e integración de servicios. | Sin correo ni documento fiscal; descarga del archivo no automatizada en QA. |
| RFU-014 · HU14 | Biblioteca, perfil | Menos de 14 días y de 120 min; devolución única al monedero. | UI + servicios, con límites. | Hora y uso locales ficticios, sin backend. |
| RFU-015 · HU15 | Perfil, carrito | Recargas de 20/50/100 soles o personalizadas, saldo y movimientos. | UI + servicios. | Sin cobro real de la recarga. |
| RFU-016 · HU16 | Biblioteca | Cuadrícula por cuenta con compras, alquileres, vencidos y Jugar. | UI + servicios. | Sin BD ni descarga/ejecución de juegos. |
| RFU-017 · HU17 | Biblioteca | Comprobación de licencia antes de Jugar y rechazo de vencidos. | UI + servicios. | No es DRM; añade 15 min ficticios de uso. |
| RFU-018 · HU18 | Biblioteca | Crear, renombrar, asignar varios juegos, filtrar y eliminar colecciones. | UI + servicios. | Persistencia en localStorage. |
| RFU-019 · HU19 | Comunidad | Solicitar, aceptar, rechazar, bloquear/desbloquear; tres estados de conexión. | UI + servicios. | Contactos, estados e interacciones ficticios, sin comunicación externa. |
| RFU-020 · HU20 | Ficha, comunidad | Licencia antes del formulario y al guardar; recomendación binaria con texto. | UI + servicios. | Propiedad de demostración, no verificación de titularidad real. |
| RFU-021 · HU21 | Ficha, carrito | Compra, 48 h y 72 h con precios; modalidad conservada al añadir. | UI + servicios. | Alquiler académico ficticio, ajeno a una oferta real de Steam. |
| RFU-022 · HU22–24 | Carrito, biblioteca | Activar al pagar, calcular vencimiento, contar y bloquear tras expirar; comprar vencido. | UI + servicios. | Reloj del dispositivo; sin revocación de software externo. |
| RFU-023 · HU25 | Biblioteca, carrito | Descuento íntegro del alquiler activo y misma licencia permanente tras pagar. | UI + servicios. | Sin transacción ni DRM reales; la conversión vencida se rechaza antes de cobrar. |

## Las 25 historias detalladas y sus criterios

| HU · relación RFU · páginas | Pantalla | Criterios representados | Estado de verificación | Criterios no cubiertos técnicamente o limitación |
|---|---|---|---|---|
| HU01 Registro · RFU-001 · 36 | Acceso | Registro con nombre/correo y paso numérico. | UI; adaptación parcial. | No unicidad central, Bcrypt ni rechazo de correo existente: prevalece aceptar cualquier correo válido. |
| HU02 Sesión · RFU-002 · 36–37 | Acceso | Correo válido, código, sesión, salida y datos por cuenta. | UI + servicios. | No comprobación de contraseña contra BD ni token de autenticación. |
| HU03 Dos factores · RFU-003 · 37 | Acceso | Bloquea texto no numérico y acepta cualquier número. | UI: `abc` rechazado, `0` aceptado. | No IP, dispositivo nuevo, correo ni código secreto real. |
| HU04 Recuperación · RFU-004 · 38 | Acceso | Recuperación local explícita y acceso posterior. | UI. | No enlace con token ni formulario de cambio/cifrado de contraseña. |
| HU05 Perfil · RFU-005 · 38–39 | Perfil | Avatar, biografía, público/solo amigos/privado y reflejo inmediato. | UI + servicios; vista visitante/amigo comprobada. | Vista ilustrativa, no control de acceso real. |
| HU06 Catálogo · RFU-006 · 39 | Inicio, catálogo | Títulos, banners, precios y descuentos dinámicos. | UI en ambas resoluciones. | Menos de 2 s no certificado como requisito no funcional de producción. |
| HU07 Búsqueda · RFU-007 · 39–40 | Catálogo | Título/desarrollador/editor y cero resultados sin error. | UI: SEGA devuelve 3 títulos; búsqueda inexistente, 0. | Catálogo local de veinte juegos. |
| HU08 Filtros · RFU-008 · 40 | Catálogo | Género, rango de precio y soporte combinados. | UI: multijugador más ofertas produce 2 coincidencias. | Metadatos de una instantánea, no consulta en vivo. |
| HU09 Detalle · RFU-009 · 41 | Ficha | Descripción completa desplegable, capturas, mínimos/recomendados y reseñas. | UI; parcial por contenido. | No se recibieron videos; Stardew Valley no publica recomendados en la fuente. |
| HU10 Deseados · RFU-010 · 41–42 | Favoritos, ficha | Añadir/quitar, vista dedicada dentro del catálogo, orden/filtros y vinculación local por correo. | UI con navegación y servicios con dos cuentas. | Sin cuenta protegida ni alertas reales. |
| HU11 Carrito · RFU-011 · 42 | Carrito | Añadir/ver/modificar/eliminar, suma con ofertas y bloqueo vacío/cero. | UI + servicios. | No DLC de muestra. |
| HU12 Pago · RFU-012 · 42–43 | Carrito | Tres métodos; rechazo por saldo insuficiente; estado Pagado y asociación a biblioteca. | UI: monedero y rechazo; servicios: los tres métodos. | No banco ni comprobación de fondos de tarjeta/móvil reales. |
| HU13 Comprobante · RFU-013 · 43 | Carrito, perfil | Recibo detallado automático e historial local persistente; opción de descargar. | UI para visualización/historial + servicios. | No correo ni documento fiscal. Descarga de archivo no automatizada en el recorrido de navegador. |
| HU14 Reembolso · RFU-014 · 44 | Biblioteca | Antigüedad menor de 14 días, uso menor de 2 h, devolución y prevención de duplicado. | UI + servicios; exactamente 14 días y 120 min rechazados. | Cálculo en navegador, sin backend ni telemetría real. |
| HU15 Cartera · RFU-015 · 44–45 | Perfil, carrito | Montos predefinidos, suma al saldo y uso para pagar. | UI: S/ 240 → recarga 50 → S/ 290; servicios. | Sin cobro real. |
| HU16 Biblioteca · RFU-016 · 45 | Biblioteca | Cuadrícula, juegos de cuenta local y botón Jugar. | UI + servicios de separación por correo. | No conexión con BD ni descarga de juegos. |
| HU17 DRM · RFU-017 · 45–46 | Biblioteca | Vigencia antes de ejecutar, botón vencido deshabilitado y error en el servicio. | UI del vencido + servicios. | No DRM ni apertura de un lanzador. |
| HU18 Colecciones · RFU-018 · 46 | Biblioteca | Crear/editar/eliminar, asignar múltiples juegos y persistir. | UI con recarga de página + servicios. | Sin persistencia central. |
| HU19 Amigos · RFU-019 · 47 | Comunidad | Enviar/aceptar/rechazar, en línea/ausente/desconectado y bloqueo que retira contacto y feed. | UI + servicios. | Estados de ejemplo y red ficticia. |
| HU20 Reseñas · RFU-020 · 47–48 | Ficha, comunidad | Licencia antes del formulario y guardado, recomendación positiva/negativa y texto publicado en ficha. | UI negativa + servicios de rechazo sin licencia. | Propiedad local de muestra, sin validación real. |
| HU21 Modalidad · RFU-021 · 48 | Ficha, carrito | Tres modalidades, alquiler fraccionado y selección conservada. | UI de 48 h; servicios también de 72 h. | Contrato ficticio. |
| HU22 Pago y activación · RFU-022, colabora RFU-012/013 · 48–49 | Carrito, biblioteca | Licencia solo tras éxito; fecha del pago + 48/72 h; ningún cambio si falla. | UI de 48 h y rechazo; servicios de 48/72 h y fallo sin mutación. | Hora local, no autoridad temporal ni proveedor reales. |
| HU23 Temporizador · RFU-022 · 49 | Biblioteca | Cuenta por segundo, distinción compra/alquiler y sin contador en permanente. | UI antes/después de convertir + servicios. | Sin reloj de servidor; el usuario puede manipular sus datos locales. |
| HU24 Expiración · RFU-022, colabora RFU-017 · 50 | Biblioteca, carrito | Bloquea Jugar al vencer, valida en el servicio y ofrece compra normal. | UI del vencido + servicios con avance controlado del reloj. | No revoca acceso a ejecutables externos. |
| HU25 Conversión · RFU-023 · 50–51 | Biblioteca, carrito | Solo vigente, descuento del 100 % y sustitución por permanente al pagar. | UI: S/ 17,90 + S/ 162,00 = S/ 179,90. Servicios: conversión vencida rechazada sin cobrar. | Sin licencia real. HU24 permite compra ordinaria del vencido: se distingue de la conversión con descuento de HU25. |

## Alcance cerrado

No se declara cumplimiento técnico de Bcrypt, autenticación, 2FA, envío de correos, privacidad, DRM, pagos bancarios, base de datos, API REST o servicios externos reales. RNF-003 solicita dos idiomas en el documento; por decisión del usuario esta demostración es exclusivamente en español. Las acciones y los datos ficticios están identificados en la interfaz.
