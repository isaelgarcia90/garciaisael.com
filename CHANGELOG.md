# Historial de cambios

Todos los cambios de garciaisael.com desde el primer commit (18 oct 2025), del más reciente al más antiguo.

- Cada versión corresponde a un Pull Request (PR) o, en el sitio anterior, a una etapa de trabajo.
- Cada commit aparece con su hash corto, su fecha y lo que cambió.
- Total en `main`: 65 commits (53 de trabajo y 12 merges de PR).

---

## [PR #12] CV reescrito con la fórmula X-Y-Z (13 nov 2026)

- Reemplaza `public/docs/Isael_Garcia_CV.pdf` por la versión nueva (mismo nombre y ruta, 4.1 MB, 1 página). El botón RESUME no cambia.
- Las viñetas de experiencia se reescribieron con la fórmula X-Y-Z:
  - **X (logro o resultado):** qué se consiguió.
  - **Y (métrica o impacto):** cómo se midió, con números, porcentajes o KPIs.
  - **Z (acción o estrategia):** qué se hizo exactamente o qué herramientas se usaron.
- Ejemplos: "Shipped a headlamp Showroom Mode feature in production Ford vehicles, developed in C and Python across the full SDLC" y "Defined 500+ software requirements across 5 systems of Renault's electric vehicle platform…".
- Los textos del sitio (Career, Work) no copian las viñetas del CV, así que no cambian.

---

## [PR #11] Brackets en los dientes del personaje (13 nov 2026)

Merge `3ac8199`.

- **`03e9c89`** (13 nov 2026). El personaje ahora tiene brackets: 6 por arcada (arriba y abajo), unidos por un alambre. Se dibujan en código en `src/components/Character/utils/character.ts` (función `addBraces`), sin tocar el modelo 3D, y van sujetos al hueso de la cabeza para seguir todas las animaciones.
- Brackets y alambre son plateados; la liga de cada bracket toma el color del modo activo (Galaxy, Sky, Hacker, Retro Terminal, Kernel Panic, Clean Code).
- No cambia `ASSET_VERSION`: el modelo `character.enc` es el mismo.

---

## [PR #10] CV actualizado en `public/docs` (13 nov 2026)

Merge `f20515d`.

- **`c260eae`** (12 nov 2026). Reemplaza el CV anterior `public/Isael_Garcia__CV.pdf` por la versión nueva, ahora en `public/docs/Isael_Garcia_CV.pdf` (4.1 MB).
- El botón RESUME de la barra (`src/components/Navbar.tsx`) apunta a `/docs/Isael_Garcia_CV.pdf`.
- La URL anterior `garciaisael.com/Isael_Garcia__CV.pdf` deja de existir.
- `README.md`: la estructura de carpetas muestra `public/docs/`.

---

## [PR #9] Historial de cambios (13 nov 2026)

Merge `5d81a22`.

- **`72958df`** (13 nov 2026). Agrega este `CHANGELOG.md` con el historial completo del proyecto, desde el sitio estático anterior hasta el PR #8.

---

## [PR #8] Documentos de The Freescale Cup (13 nov 2026)

Merge `2ef8baf`.

- **`1e98146`** (13 nov 2026). Agrega dos PDF en la carpeta nueva `public/docs/`:
  - `the_freescale_cup_2011.pdf` (439 KB)
  - `the_freescale_cup_2012_2013.pdf` (251 KB)

  Quedan públicos en `garciaisael.com/docs/<nombre>.pdf`.

---

## [PR #7] Diseño responsivo y rendimiento para celular, tablet y escritorio (12 al 13 nov 2026)

Merge `2d58e3f`. Adapta el sitio a celular, tablet (vertical y horizontal) y escritorio con un estilo consistente, y lo hace más ligero y fluido, sobre todo en tablet. Se probó en un celular de unos 364 px de ancho y en una tablet Samsung en las dos orientaciones.

### Resumen del PR

**Barra superior**
- El logo de la gorra `< IG >` sustituye al logo de Instagram y lleva al inicio.
- RESUME (`/Isael_Garcia__CV.pdf`) va junto al menú de tema en todos los tamaños.
- Se quitó LinkedIn de la barra; ahora está en Contact.
- Etiquetas del menú: About Me, What I Do, Experience, My Work, Contact.
- Hasta 1024 px se usa menú hamburguesa.
- La altura de la barra se comparte con el CSS como `--navH`.

**Estilo común** (`src/components/styles/consistency.css`, se carga al final)
- Todos los títulos de sección usan el mismo tamaño, color y formato (mayúsculas y minúsculas mezcladas).
- Escala de texto por tamaño de pantalla: celular (menos de 600 px), tablet vertical (600–1024 px, letra más grande) y escritorio.
- En una columna (≤1024 px), todas las secciones comparten ancho, incluidas las tarjetas de What I Do, la línea de Experience y Contact.
- Cada sección llena la pantalla (`100lvh`), así que al saltar desde el menú solo se ve esa sección.

**Tablet horizontal (pantallas táctiles de más de 1024 px)**
- Al tocar una opción del menú, el sitio calcula antes de moverse dónde quedará el título y hace un solo desplazamiento. Todos los títulos quedan a 32 px de la barra, sin ajuste final.
- El texto de About Me aparece solo cuando el personaje ya terminó de moverse a un lado.
- What I Do muestra tarjetas fijas, sin desplegable, más chicas, a la derecha y debajo de la barra. El desplegable con hover se queda solo para escritorio con mouse.
- El personaje se centra con márgenes y no con transform, porque GSAP borraba el centrado.

**Secciones**
- Contact: Connect muestra LinkedIn, GitHub e Instagram con sus usuarios (@isaelgarcia90, @isaelgarcia90, @isaelgarcia.ia). Se quitaron el bloque Social y el correo, y los años vuelven a gris.
- My Work: las flechas y los puntos van debajo del título y todas las vistas previas se muestran completas con el mismo marco.
- My Techstack: el título es igual al de las demás secciones y el carrusel tiene el mismo ancho.

**Celular**
- En horizontal aparece el aviso para girar el teléfono, en español si el teléfono está en español y en inglés en los demás casos.
- Los brillos morados de la portada se ocultan al salir de ella.
- En pantallas táctiles no se muestra el cursor personalizado.

**Rendimiento**
- Congelamientos en tablet: la barra de Chrome, al aparecer y desaparecer durante el scroll, disparaba eventos `resize` que reconstruían todas las animaciones. Ahora solo reaccionan si cambia el ancho (`src/components/utils/widthResize.ts`).
- Se corrigieron fugas que se acumulaban en cada resize: el listener `refresh` de SplitText, el `setInterval` y el timeline infinito del monitor, y el listener de tema.
- En pantallas táctiles se omite la animación de texto palabra por palabra (SplitText).
- El modelo se comprimió con meshopt: `character.enc` pasó de 2.34 MB a 1.40 MB y sigue cifrado con la misma clave.
- El HDR del entorno pasó de 296 a 84 KB, las texturas del Techstack de 275 a 111 KB y la vista previa de forzeswater de 136 a 85 KB.
- El canvas del Techstack se carga solo al acercarse a esa sección y se pausa fuera de pantalla.
- En dispositivos táctiles se limita la resolución (dpr) y se desactivan la oclusión ambiental (AO) y las sombras.
- En una columna, el personaje deja de dibujarse cuando no está en pantalla.

**Caché**
- `vercel.json` envía `Cache-Control: public, max-age=31536000, immutable` para `/assets`, `/models`, `/draco` e `/images`.
- Las URLs de los assets llevan `?v=` desde `src/assetVersion.ts`. Un plugin de Vite escribe ese mismo número en el preload de `index.html` (`%ASSET_VERSION%`).
- **Al reemplazar un modelo, una textura o una imagen, solo hay que subir `ASSET_VERSION` en `src/assetVersion.ts`.**

### Commits

- **`62d15ea`** (12 nov). Mejora el diseño en celular:
  - Barra de una fila con botón de menú (About, My Work, Contact, Resume); los enlaces del menú llevan a su sección también en celular.
  - Se oculta el botón flotante de RESUME en celular, porque ya está en el menú.
  - Texto de About a un tamaño legible.
  - Experience en una columna con los años arriba de cada puesto.
  - My Work: se cambia de proyecto deslizando, con las flechas junto a los puntos.
- **`acb7b6a`** (12 nov). Diseño en celular, ronda 2:
  - Nombre y título de la portada más chicos; el nombre queda arriba de la gorra.
  - El botón de tema muestra el nombre del modo.
  - About, What I Do, Experience, My Work y Contact con texto más chico y justificado.
  - Tarjetas de What I Do compactas, con las habilidades siempre visibles.
  - WHAT I DO y EXPERIENCE se agregan al menú en todos los tamaños; el botón de menú se usa hasta 1024 px; el enlace de LinkedIn en la barra solo aparece en pantallas muy anchas.
  - Contact muestra cada título universitario en su propio bloque.
- **`424cdd2`** (12 nov). Diseño en celular, ronda 3, con un estilo consistente:
  - Los títulos de sección toman el estilo de About Me (mayúsculas y minúsculas mezcladas, color del tema) en todos los tamaños.
  - Escala de texto en celular: títulos 24, títulos de elementos 16, texto 14, etiquetas 12.
  - Cada sección llena la pantalla; se quitaron los márgenes negativos que encimaban secciones.
  - El menú de secciones usa la tipografía del menú de tema, y solo uno de los dos menús puede estar abierto a la vez.
  - Nombre de la portada centrado y título sobre el pecho.
  - Se crea `consistency.css`.
  - Se corrige el error tipográfico "product inquiries".
- **`9e5c4d3`** (12 nov). Celular, ronda 4:
  - Flechas y puntos de My Work debajo del título.
  - Connect con LinkedIn, GitHub e Instagram y sus usuarios; se quita el bloque Social y los años vuelven a gris.
  - Rendimiento: resolución del 3D limitada, la escena deja de dibujarse fuera de pantalla, se corrige una fuga del listener `touchmove`, el cursor y los íconos magnéticos se omiten en táctil y se quita el desenfoque de la barra en celular.
- **`0df03ce`** (12 nov). RESUME (con ícono) siempre visible en la barra, en lugar del enlace de LinkedIn y del botón flotante. "About" pasa a "About Me". El título de My Techstack usa el estilo común.
- **`1237bf4`** (12 nov). Ronda 6:
  - Logo de la gorra `< IG >` que lleva al inicio; RESUME debajo del menú de tema.
  - Títulos de My Techstack y What I Do alineados con las demás secciones.
  - Mismo marco para todas las vistas previas de My Work.
  - Aviso para girar el teléfono cuando está en horizontal.
  - La vista 3D sigue el tamaño de su caja (el personaje ya no se corta al girar la tablet).
  - El Techstack se pausa fuera de pantalla, con menos resolución y sin AO ni sombras en táctil.
- **`7809b4b`** (12 nov). Ronda 7:
  - Personaje centrado con márgenes en lugar de transform (en tablet GSAP lo empujaba a la derecha).
  - Tablet vertical en una columna con letra más grande.
  - Vistas previas completas en el mismo marco.
  - My Techstack del mismo ancho que las demás secciones, con bordes suaves y la cámara más alejada.
- **`74c7d3b`** (12 nov). Ronda 8:
  - Caché de un año (`immutable`) y versión `?v=` en los assets.
  - HDR de 296 a 84 KB, texturas de 275 a 111 KB y vista previa de forzeswater de 2461 a 1280 px.
  - El Techstack se carga en diferido y el modelo se precarga desde `index.html`.
  - En tablet horizontal y escritorio: RESUME junto al tema, menú más compacto y personaje más abajo en pantallas bajas.
  - El personaje siempre se dibuja en escritorio, y los títulos ya no se ocultan por la animación de texto.
- **`3074580`** (12 nov). Comprime el modelo con meshopt (de 2.34 a 1.40 MB) y lo vuelve a cifrar con la misma clave. El cargador usa el decodificador meshopt de three-stdlib, sin descargas extra. La versión de assets sube a 4.
- **`3e6a293`** (12 nov). Tablet:
  - Elimina los congelamientos al hacer scroll: los resize solo reaccionan a cambios de ancho y se corrigen las fugas de listeners y timers.
  - Se quita la animación de texto en táctil.
  - About Me queda oculto detrás del personaje al cargar.
  - Tarjetas de What I Do fijas en tablet horizontal.
  - Versión de assets automática en `index.html` mediante un plugin de Vite.
- **`192c0cd`** (13 nov). Tablet:
  - About Me aparece después de que el personaje se mueve.
  - La misma distancia entre la barra y el título en todas las secciones.
  - Tarjetas de What I Do debajo de la barra.
  - Sin cursor en táctil.
- **`cd9a216`** (13 nov). Menú en tablet: calcula la posición exacta del título antes de desplazarse, así que la sección llega sin ajuste final.
- **`927cd91`** (13 nov). RESUME junto al menú de tema también en celular y tablet vertical.
- **`ba9b23b`** (13 nov). Tablet vertical: letra más grande, un ancho común para todas las secciones y menos espacio vacío.
- **`7ebac97`** (13 nov). Tablet vertical a partir de 600 px de ancho (la tablet probada mide unos 712 px en vertical). Cada sección llena la pantalla completa, así que al navegar solo se ve una sección.
- **`16dd7f2`** (13 nov). Contact alineado con las demás secciones en tablet vertical. Los brillos morados de las esquinas se desvanecen después de la portada en celular y tablet.
- **`572da63`** (13 nov). Oculta el brillo morado detrás del personaje después de la portada en celular y tablet, porque se asomaba sobre What I Do.
- **`ad1a8b9`** (13 nov). Aviso para girar el teléfono en español cuando el teléfono está en español.

---

## [PR #6] Galaxy como modo por defecto (12 nov 2026)

Merge `6a95268`.

- **`5235702`** (12 nov). Galaxy (violeta) pasa a ser el modo por defecto (`DEFAULT_THEME_ID` y los valores de `:root` en `index.css`).
  - El modo Cloud cambia de nombre a Sky; si un visitante tenía `cloud` guardado, se carga Sky.
  - Nuevo orden del menú: Galaxy, Sky, Hacker, Retro Terminal, Kernel Panic, Clean Code.

---

## [PR #5] Notificación en Discord por cada visita (12 nov 2026)

Merge `af65afd`.

- **`82ffa9d`** (12 nov). Nueva Vercel Function `api/visit.ts`:
  - Envía a Discord un mensaje con la ubicación (encabezados geo de Vercel), el dispositivo y la página de origen.
  - Usa la variable de entorno `DISCORD_WEBHOOK_URL`, configurada en Vercel para Production y nunca guardada en el repo.
  - Solo acepta peticiones con origen garciaisael.com, ignora bots, quita menciones y responde 204 si falta la variable.
  - `notifyVisit()` en `analytics.ts` la llama una vez por sesión del navegador y solo en el dominio de producción.

---

## [PR #4] Eventos de Google Analytics (12 nov 2026)

Merge `4229626`.

- **`f17fa58`** (12 nov). Nuevo `src/components/utils/analytics.ts`:
  - `trackEvent()` envuelve `gtag`.
  - `trackSectionViews()` envía `section_view` una vez por sección y visita (landing, about, what_i_do, career, work, tech_stack, contact).
  - `ThemeSwitcher` envía `theme_change` con el nombre del modo.
  - Los parámetros `theme` y `section` coinciden con las dimensiones personalizadas creadas en GA4.
  - `.gitignore` ignora la carpeta local `blender/`, que tiene el modelo sin cifrar.
- **`1b2487c`** (12 nov). Corrige la línea de `blender/` en `.gitignore`.

---

## [PR #3] Google Analytics (11 nov 2026)

Merge `f6e7341`.

- **`6f81cdd`** (12 nov). Vuelve a agregar a `index.html` la etiqueta gtag.js con el ID `G-SRHTVVLTLN`, el mismo del sitio anterior, para volver a medir visitas.

---

## [PR #2] Modos de color, intro con silueta y nuevo texto de About (11 nov 2026)

Merge `136f40c`.

- **`0d05de7`** (12 nov). Selector de tema en la barra con 6 modos que se guardan en `localStorage`. Al principio eran Kernel Panic (por defecto), Hacker, Retro Terminal, Cloud, Galaxy y Clean Code; el PR #6 cambió el orden y el modo por defecto.
  - Cada modo cambia los colores de acento, el cursor, los hovers de redes y RESUME.
  - En el personaje cambia la visera de la gorra, las mangas, las suelas, el logo de la gorra (generado en código) y la luz del monitor.
  - Archivos nuevos: `src/theme/theme.ts`, `src/theme/themes.ts`, `ThemeSwitcher.tsx` y `ThemeSwitcher.css`.
  - La pantalla de carga con porcentaje se reemplaza por la silueta oscura del personaje. Los textos, el menú y el scroll aparecen cuando se encienden las luces, con un respaldo a los 15 s.
  - Se reescribe el segundo párrafo de About.

---

## [PR #1] El portafolio 3D reemplaza al sitio estático (26 oct 2026)

Merge `7c1bc57`.

- **`a8d8d06`** (26 oct 2026). Reemplaza todo el sitio estático (index, now, blog, ai-projects, contact, achievements, list-100) por el portafolio 3D interactivo.
  - Stack: React 18, TypeScript, Vite, Three.js y GSAP (ScrollTrigger, ScrollSmoother, SplitText).
  - Basado en la plantilla MIT interactive-3d-portfolio, con tu contenido: About, What I Do, Experience, My Work (forzeswater.com y alanisael.com), Techstack, Contact y el CV `public/Isael_Garcia__CV.pdf`.
  - Personaje 3D cifrado en `public/models/character.enc`; la carpeta local `blender/` se dejó fuera a propósito.
  - Nuevo `README.md` con crédito a la plantilla original.
  - Nuevo `vercel.json` para que Vercel ejecute `npm ci` y `npm run build` y sirva `dist/`; antes se servían archivos estáticos sin compilar.
  - Las URLs anteriores (`/blog/`, `/achievements/`, etc.) dejan de existir a propósito; su contenido sigue en el historial de git.
  - Google Analytics del sitio anterior no se incluyó en este paso; se volvió a agregar en el PR #3.

---

## Sitio estático anterior (18 oct 2025 a 7 oct 2026)

Sitio hecho a mano en HTML, CSS y JavaScript, sin compilación. Todos sus commits, del más reciente al más antiguo.

### Contenido enfocado en IA (sep a oct 2026)

- **`afef8dd`** (7 oct 2026). Actualiza las redes sociales y la descripción del perfil con enfoque en IA.
  - Nueva página `ai-projects/`.
  - Nuevos `js/site-config.js` y `js/social-links.js` para centralizar las redes.
  - Se rediseña `css/style.css` y se eliminan `css/style.obsolete.css` e `index.ai.html`.
- **`a9573b6`** (18 sep 2026). Ajusta la redacción de todas las páginas para reflejar mejor el perfil de AI Engineer y desarrollo web.

### Achievements y apertura a oportunidades (jun 2026)

- **`13bb7dd`** (15 jun 2026). Achievements describe The Freescale Cup a detalle.
- **`007048d`** (14 jun 2026). Agrega "I'm OPEN to hearing about other kinds of opportunities as well." en la portada y en Now.

### Sitio de varias páginas (may 2026)

- **`2f520a0`** (29 may 2026). Cambia el tamaño de letra en Achievements.
- **`2ca5e88`** (29 may 2026). Actualiza la sección Achievements.
- **`a4585cc`** (29 may 2026). Actualiza el contenido y el estilo de todas las páginas HTML, sobre todo list-100 y Now.
- **`6248a63`** (11 may 2026). Rediseño del sitio como un sitio de varias páginas:
  - Páginas `now/`, `blog/`, `contact/`, `achievements/` y `list-100/`.
  - Primer artículo del blog: `2026/05/10/transitioning-to-ai-engineering.html`.
  - Hoja de estilos `css/style.css` y script `js/main.js`.
  - PDF de la Gaceta Politécnica 2011 y 2013 en `assets/doc/`.
  - La foto pasa a `assets/image/profile.jpg`.

### Perfil Linux (mar 2026)

- **`ed229a1`** (2 mar 2026). Actualiza el perfil hacia Linux y guarda la versión con enfoque en IA como `index.ai.html`.

### Video de avatar y My Projects (dic 2025)

- **`e5e94cd`** (9 dic 2025). Cambia `avatar.mp4` por una versión estilo Ghibli.
- **`75847db`** (9 dic 2025). Cambia `avatar.mp4` y la descripción del perfil; guarda copias de respaldo `index.embedded.html` e `index.ori.html`.
- **`ded32c4`** (5 dic 2025). Los enlaces pasan de morado a blanco.
- **`d7c8431`** (4 dic 2025). Agrega la sección "My Projects".
- **`e4842f2`** (4 dic 2025). Cambia el color del texto a cian.
- **`c1633f1`** (4 dic 2025). En celular, el video se reproduce con el primer toque.
- **`c97706e`** (4 dic 2025). Agrega el video de avatar (`assets/video/avatar.mp4`) y cambia la descripción del perfil.
- **`554d2f9`** (3 dic 2025). La descripción del perfil incluye la formación en IA.

### Primeros pasos (oct 2025)

- **`00608bc`** (23 oct 2025). Agrega Google Analytics (`G-SRHTVVLTLN`).
- **`1ddd6c7`** (23 oct 2025). Quita el apellido materno "Luis" para que el nombre quepa en la pantalla del celular.
- **`30fbe9b`** (23 oct 2025). Agrega un juego interactivo de escritura de comandos Linux mientras el sitio estaba en construcción, y la foto `Isael.jpg`.
- **`876b728`** (18 oct 2025). Sitio inicial del portafolio: un solo `index.html`.
