# GVOX · Informe de Etapa 0

Fecha: 29 de octubre de 2026, hora de Lima. Estado: **preparación terminada; implementación pendiente de aprobación expresa**.

## 1. Directorio y estructura preparada

Se utilizó exclusivamente el proyecto existente `C:\Users\cesar\OneDrive\Desktop\GVOX\gvox-web`. No se creó otra carpeta GVOX ni otro proyecto. Al inspeccionarlo inicialmente estaba vacío. Los seis directorios de material original también estaban vacíos; por instrucción posterior del usuario se copiaron los paquetes desde el escritorio, conservando su anidación y sin modificar los archivos de origen.

```text
GVOX/
├── 00_MATERIAL_ORIGINAL/
│   ├── 01_IDENTIDAD/GVOX_01_IDENTIDAD/
│   ├── 02_PORTADA_AUTENTICACION/GVOX_02_PORTADA_AUTENTICACION/
│   ├── 03_CATALOGO/
│   ├── 04_GALERIAS/
│   ├── 05_COMUNIDAD/GVOX_05_COMUNIDAD_PERFILES/
│   └── 06_WIREFRAMES/GVOX_06_WIREFRAMES_FINALES/
└── gvox-web/
    ├── assets/
    │   ├── css/{base,components,pages}/
    │   ├── js/{core,components,pages,services,strategies/payment}/
    │   └── img/
    │       ├── branding/{logos,fondos,etiquetas}/
    │       ├── portada/
    │       ├── login/
    │       ├── videojuegos/<identificador-del-juego>/
    │       ├── galerias/<identificador-del-juego>/
    │       └── comunidad/{avatares,banners,publicaciones,actividad}/
    ├── data/
    │   ├── juegos.json
    │   ├── galerias.json
    │   ├── recursos.json
    │   ├── comunidad-recursos.json
    │   └── portada-presupuesto.json
    ├── docs/
    │   ├── INFORME_ETAPA_0.md
    │   ├── ARQUITECTURA.md
    │   ├── INVENTARIO_RECURSOS.md
    │   ├── RECURSOS.md
    │   ├── ARBOL_DIRECTORIOS.txt
    │   ├── requisitos.csv
    │   └── registros/
    ├── herramientas/descargas/{02,03,04,05}/
    ├── pages/
    ├── scripts/
    ├── package.json
    └── README.md
```

Las carpetas de CSS, JS y páginas están reservadas: no contienen pantallas ni lógica de aplicación. Algunas categorías de imágenes pueden compartir rutas con otras para evitar archivos idénticos; por ejemplo, las imágenes laterales de acceso reutilizan los WebP verticales del juego adecuado, por lo que `login/` queda reservado sin duplicarlos. El árbol expandido real está en `ARBOL_DIRECTORIOS.txt`.

## 2. Inventario de los seis paquetes

| Paquete | Archivos recibidos | Recursos encontrados |
|---|---:|---|
| 01 · Identidad | 24 | 19 recursos de marca: 14 SVG, 4 PNG e ICO; tokens, manifiesto y vista previa |
| 02 · Portada y acceso | 7 | 12 referencias: 4 héroes, 4 imágenes de acceso y 4 promociones; MJS, fuentes CSV, manifiesto y dos HTML de demostración |
| 03 · Catálogo | 25 | 20 juegos reales, cada uno con 3 recursos previstos; JSON, MJS, CSV, vista previa y 20 marcadores `.directorio` sin imágenes |
| 04 · Galerías | 7 | Plan de 76 capturas y 8 fondos; JSON, MJS, CSV, BAT, documentación y vista previa |
| 05 · Comunidad | 18 | 21 referencias: 8 avatares, 4 fondos, 5 publicaciones y 4 miniaturas; MJS, JSON, CSV, CSS, JS, demos y cuatro capturas |
| 06 · Wireframes | 38 | 8 HTML finales, CSS compartido, JS de demostración, 9 capturas, 16 recursos gráficos y documentación con los 23 RFU |
| **Total recibido** | **119** | **49 imágenes preexistentes, contando marca y referencias visuales** |

Los paquetes 02–05 inicialmente no contenían las imágenes promocionales previstas. Los 15 WebP del paquete 06 son arte conceptual de juegos ficticios; no se incorporaron como contenido del proyecto definitivo. Las capturas de maquetas tampoco se usan como imágenes de videojuegos.

La identidad cromática, tipografía, discrepancias entre versiones y criterio de precedencia están documentados en `ARQUITECTURA.md`. La referencia principal sigue siendo el paquete 06; no se rediseñó ni se modificó.

## 3. Descargas y validación

Node.js instalado: **v24.21.0**. No se instalaron dependencias. Se revisaron los cuatro descargadores y sus fuentes antes de ejecutarlos únicamente desde copias de trabajo.

| Paquete | Previstas | Disponibles y verificadas | Pendientes |
|---|---:|---:|---:|
| 02 · Portada y acceso | 12 | 12 | 0 |
| 03 · Catálogo | 60 | 60 | 0 |
| 04 · Galerías | 84 | 84 | 0 |
| 05 · Comunidad | 21 | 21 | 0 |
| **Total** | **177** | **177** | **0** |

El primer intento de galerías rechazó seis fondos con contenido PNG anunciado por el servidor como JPEG. Se conservan los fallos iniciales en `registros/descarga-04-primer-intento.json`. Se corrigió exclusivamente la copia de trabajo para detectar el formato real por firma binaria y se reintentó: las 84 imágenes del paquete quedaron disponibles, sin fallos finales. Los PNG originales mantienen la extensión `.png`.

La conexión inicial restringida no resolvía los dominios de Steam; la ejecución autorizada con acceso de red completó las descargas. Las URL proceden de los manifiestos y de las respuestas de Steam para el ID correspondiente. No se descargaron ejecutables, no se ejecutaron los BAT y no se generaron imágenes con IA.

La consolidación inicial reunió **196 referencias lógicas**: 19 de marca y 177 de contenido, sobre **180 originales únicos**, evitando 16 copias binarias. Cada referencia conserva juego, fuente, formato, tamaño y SHA-256.

## 4. Optimización y recursos disponibles

Por indicación adicional del usuario, se archivaron **161 originales descargados únicos** dentro de los paquetes correspondientes de `00_MATERIAL_ORIGINAL`, sin sobrescribir los 119 archivos recibidos. Las referencias que usaban el mismo archivo comparten ese original. Los 19 recursos de marca ya estaban conservados allí.

Se crearon WebP por uso, con calidad 88, sin ampliar imágenes pequeñas y con compresión sin pérdida para la marca ráster. Los SVG se conservan vectoriales y el ICO permanece como favicon. Hay **173 WebP, 14 SVG y 1 ICO: 188 archivos finales únicos**, con cero duplicados binarios. Los ocho archivos adicionales respecto de los 180 originales corresponden a derivados de tamaños distintos para usos distintos, no a copias idénticas.

| Medida | Bytes | MB decimales |
|---|---:|---:|
| Todas las imágenes conservadas en material original, incluidas maquetas y arte conceptual: 210 archivos | 61 108 971 | 61,11 |
| Originales únicos que sí se utilizarán en el sitio: 180 archivos | 55 687 383 | 55,69 |
| Recursos finales optimizados y vectores conservados: 188 archivos | 21 133 249 | 21,13 |
| **Ahorro sobre los originales utilizados** | **34 554 134** | **34,55 · 62,05 %** |

1 MB = 1 000 000 bytes. El ahorro compara el contenido realmente utilizable con sus derivados; no incluye capturas ni recursos conceptuales ajenos a la aplicación. El total de 21,13 MB corresponde a todo el sitio previsto, no a una sola página.

Se verificaron todos los WebP mediante apertura, dimensiones y decodificación completa, además de las firmas durante descarga. También se revisó visualmente una hoja con las veinte portadas reales. Los inventarios de JSON no apuntan a imágenes ausentes. Los perfiles y las rutas están en `RECURSOS.md` y `data/recursos.json`.

**Presupuesto de portada:** hero principal, cinco tarjetas, tres promociones, marca y favicon suman **510 846 bytes (0,51 MB)**. Con una reserva de 600 000 bytes para el resto de recursos, la previsión es **1 110 846 bytes (1,11 MB)**, por debajo del objetivo aproximado de 3 MB. Es una estimación de recursos: la carga completa se medirá cuando exista la pantalla. El manifiesto prepara dimensiones, carga diferida y prioridad; no se implementaron etiquetas ni lógica de lazy loading todavía.

**Disponibles:** identidad, favicon, veinte juegos con sus tres imágenes de catálogo, galerías completas, ocho fondos destacados, doce recursos de portada/acceso/promoción y veintiún recursos de comunidad. **Imágenes previstas faltantes: ninguna.**

## 5. Propuesta de HTML, CSS y JavaScript

`ARQUITECTURA.md` detalla los ocho HTML independientes: inicio, catálogo, ficha, carrito, acceso, biblioteca, comunidad y perfil/monedero. Cada pantalla tendrá su CSS particular y entrada ES6, además de CSS global, componentes compartidos, servicios locales y estrategias de pago simulado.

Solo se crearon directorios, herramientas de preparación, documentación y JSON de recursos. No se copiaron los wireframes como implementación ni se crearon `index.html`, pantallas definitivas, CSS funcional o servicios del sistema. `package.json` es privado, sin dependencias ni proceso de compilación, y solo expone herramientas de preparación.

## 6. Problemas y decisiones pendientes

- No se encontró el documento completo de requisitos del curso: se dispone de la matriz RFU-001 a RFU-023 y de la guía recibida. Contrastar con el documento si se incorpora antes de afirmar cumplimiento global.
- Los materiales tienen cortes móviles de 767, 950 y 1023 px y variaciones menores de paleta. Se documentó usar el criterio final del 06: negro hasta 1023 px, además de la regla táctil de poca altura. Consolidar los tokens al implementar, sin rediseñar.
- La autenticación, pagos, DRM, reembolsos, alquiler y comunidad todavía no se implementaron. Los estados de la matriz original describen los bocetos recibidos y no acreditan funcionamiento en este proyecto.
- Los datos de precio y alquiler son ficticios. La futura aplicación leerá JSON local y almacenamiento del navegador; las llamadas a Steam se limitan a esta preparación.
- La cobertura de carga diferida y el tamaño real de carga en frío requieren la pantalla implementada. La estimación deja margen respecto de 3 MB.
- Al comenzar la demostración se necesitará un servidor estático local para módulos y lectura de JSON. Node no será un backend del sistema.

No quedan bloqueos de descarga ni faltantes de imágenes del plan actual.

## 7. Integridad de los originales

La verificación SHA-256 comparó los **119 archivos recibidos** tanto en sus carpetas del escritorio como en las copias de `00_MATERIAL_ORIGINAL`: **sin diferencias ni archivos recibidos eliminados**. Los scripts originales siguen intactos, incluido el descargador de galerías. Solo se incorporaron allí los 161 binarios descargados sin compresión, autorizados por la indicación adicional del usuario, y se verificaron también sus huellas.

El archivo `registros/verificacion-originales.json` registra el resultado. `registros/verificacion-recursos.json` confirma rutas, huellas, ausencia de duplicados y **cero pantallas desarrolladas**. No se escribieron cambios fuera de la carpeta GVOX.

## 8. Recomendaciones para Etapa 1

1. Esperar la aprobación expresa del usuario antes de implementar la portada.
2. Tomar `01_inicio.html` y su captura del paquete 06 como referencia de composición; utilizar la marca original y los WebP reales del inventario final.
3. Comenzar por tokens coherentes, regla de pantalla negra y componentes visuales comunes; después componer únicamente la pantalla autorizada.
4. Usar la imagen principal con carga prioritaria y diferir imágenes fuera de la primera vista. Reservar sus dimensiones para evitar saltos de diseño.
5. Verificar fidelidad visual a 1440 × 900 y 1600 × 900 y medir la carga con caché vacía. Mantener los demás flujos pendientes hasta su etapa correspondiente.

**La Etapa 0 termina con este informe. No se inició el desarrollo de la landing.**
