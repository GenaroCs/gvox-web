# GVOX · Prototipo académico

Ocho pantallas independientes con HTML5, CSS3, JavaScript ES6 y JSON local. Sin frameworks ni dependencias que instalar.

**Integración final:** ilustraciones de aventura independientes, diez avatares cartoon sin nombres en el selector, logotipo compartido, métodos Saldo Gvox/Visa/Mastercard/Yape y mejoras de lectura en las ocho pantallas. El PDF completo se conserva en `../00_MATERIAL_ORIGINAL/GVOX_REQUISITOS_ORIGINALES.pdf`.

- [Informe final y verificación](docs/INFORME_FINAL.md).
- [Galería de capturas reales de las ocho pantallas](docs/CAPTURAS_FINALES.html).

## Iniciar

Desde esta carpeta, con Node.js 18 o superior:

```powershell
npm start
```

También puedes abrir `INICIAR_GVOX.cmd` o ejecutar `node scripts/servidor.mjs`. Visita **http://127.0.0.1:4173**. Ctrl+C detiene el servidor. La variable `PORT` permite elegir otro puerto. No abras los HTML con `file://`: los módulos y el JSON requieren localhost.

## Recorrido de demostración

1. En Acceso, usa cualquier correo válido, o el botón de correo de prueba.
2. Escribe cualquier código numérico, incluso `0`. No se envían correos ni se verifican contraseñas.
3. Elige Metaphor: ReFantazio en Catálogo y añade el alquiler de 48 horas al carrito.
4. Paga con el monedero ficticio. Comprueba el recibo y la licencia con vencimiento en Biblioteca.
5. Usa Convertir a compra: se descuenta todo el alquiler activo. Tras pagar, la misma licencia será permanente y no mostrará temporizador.

Cada correo conserva datos locales separados. La cuenta de ejemplo comienza con S/ 240 ficticios, dos compras, un alquiler activo, uno vencido, una colección y amigos. La fecha de los ejemplos se calcula al crear la cuenta. Restablecer demo, al pie de cada página, borra los cambios de las cuentas locales de Gvox y recupera los ejemplos.

## Estructura

- `index.html`: inicio y promociones.
- `pages/`: catálogo, ficha, carrito, acceso, biblioteca, comunidad y perfil/monedero.
- `assets/css/`: base, componentes, estilos globales y por pantalla.
- `assets/js/`: core, componentes, servicios, estrategias de pago y entradas por página.
- `data/`: catálogo, contenido, galerías e información de demostración.
- `scripts/servidor.mjs`: servidor estático, sin endpoints de negocio.

Favoritos, carrito, biblioteca, saldo, perfil, colecciones, comunidad y recibos usan localStorage; la sesión utiliza sessionStorage. El correo selecciona una cuenta de prueba, no acredita identidad. No hay contraseñas, tokens de seguridad, cifrado, DRM, pagos, correos o privacidad de servidor reales. Avatares de videojuegos, publicaciones y reseñas son de demostración.

En anchos inferiores a 1024 px se muestra únicamente negro. Se reutilizan los WebP optimizados: hero prioritario y carga diferida de imágenes secundarias.

## Comprobaciones

```powershell
node scripts/comprobar_flujos.mjs
node scripts/verificar_originales.mjs
```

El primer comando utiliza almacenamiento temporal en memoria, sin cambiar las cuentas del navegador. Los registros de Etapa 0 se conservan como antecedentes.

- [Cobertura de los 23 RFU y las 25 HU](docs/COBERTURA_REQUISITOS.md).
- [Resultados finales de verificación](docs/INFORME_FINAL.md).
- [Verificación de Etapa 1, como antecedente](docs/VERIFICACION_ETAPA_1.md).
- [Arquitectura](docs/ARQUITECTURA.md).

Contenido pendiente: no se recibieron videos locales. Stardew Valley no publica requisitos recomendados en los metadatos consultados. Los criterios que requieren backend se representan localmente y no se declaran como servicios reales.
