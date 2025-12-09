# EVORIX WEB - Documentación Técnica

## 1. Descripción Técnica del Proyecto

**EVORIX WEB** es la plataforma digital central del ecosistema EVORIX. Es un sitio web **estático de alto rendimiento** diseñado para servir como punto de contacto público, herramienta de marketing personal y hub de conversión para servicios fiscales y tecnológicos.

### ¿Por qué un sitio estático?
El proyecto prioriza la **velocidad de carga**, la **seguridad** y la **simplicidad de despliegue**. Al no depender de bases de datos en tiempo real ni de renderizado en servidor (SSR) para la vista pública, se garantiza una experiencia de usuario inmediata y fluida, desplegable en cualquier CDN (como GitHub Pages o Netlify).

### Propuesta de Valor y Diferenciadores
A diferencia de plantillas genéricas, EVORIX WEB implementa:
*   **Canvas Engine Personalizado**: Un sistema de partículas dinámico que reacciona a la navegación del usuario sin librerías externas pesadas.
*   **Diseño Modular "Glassmorphism"**: Interfaz moderna con efectos de desenfoque y transparencias gestionados mediante CSS puro.
*   **Arquitectura Sin Frameworks**: Construido 100% en Vanilla JS, HTML5 y CSS3, eliminando el "bloat" de librerías como React o Vue para una web institucional.
*   **Experiencia Guiada (Tour)**: Un sistema de navegación automática programada para guiar al usuario por la propuesta de valor.

---

## 2. Arquitectura Completa

La estructura del proyecto es plana y semántica, facilitando el mantenimiento directo.

### Estructura de Directorios

```text
/ (Raíz)
│
├── index.html            # Landing page principal (SPA-feel)
├── casos.html            # Páginas de soporte y contenido extendido
├── certificaciones.html
├── evoapp-loader.html    # Loader intermedio para aplicaciones externas
├── privacy.html
│
├── css/
│   └── styles.css        # Archivo maestro de estilos (Variables, Reset, Componentes)
│
├── js/
│   └── main.js           # Lógica encapsulada (IIFE), Canvas, Interacciones
│
└── assets/               # Recursos estáticos
    ├── images/           # Avatares, logos, screenshots
    └── icons/            # SVGs y favicons
```

### Mapa del Flujo de Usuario

```text
[Entrada] -> [Detección de Tema (Dark/Light)] -> [Inicialización Canvas]
    │
    ├── Activo: Scroll Manual
    │     ├── Hero (Partículas modo 'Hero')
    │     ├── Servicios (Tabs dinámicas)
    │     ├── Ecosistema/Apps (Partículas modo 'Apps')
    │     └── Contacto (WhatsApp/Mailto)
    │
    └── Activo: Tour Guiado ("Evolucionar")
          └── Secuencia programada de scroll y demos visuales
```

---

## 3. Explicación Archivo por Archivo

### HTML (`index.html`)
El esqueleto semántico del sitio. Usa secciones con IDs únicos para la navegación y el "Spy Scroll".

*   **`#evorix-canvas`**: Elemento `<canvas>` fijo en el fondo (`z-index: -1`) que renderiza las animaciones globales.
*   **Header**: Barra de navegación fija con logo, menú de iconos (SVG) y *toggle* de tema.
*   **`#inicio` (Hero)**: Título principal, subtítulo y CTAs ("Evolucionar", "Contacto").
*   **`#servicios`**: Contiene un selector de pestañas (`.services-list`) y un panel de detalle (`#service-panel`) que cambia su contenido vía JS.
*   **`#ecosistema`**: Dashboard visual (`.grid-dashboard`) que muestra las "EVOAPPs" (EVOAPP, Tools, Lab IA) con animaciones CSS de terminales y servidores.
*   **`#referencias`**: Carrusel de testimonios (`.references-track`) con scroll horizontal nativo.
*   **`#sobre-mi`**: Texto biográfico y avatar, optimizado para lectura.
*   **`#reconocimientos`**: Sección con acordeones (`.accordion-card`) para listar formación académica en móvil.
*   **`#contacto`**: Grid de enlaces directos (WhatsApp, LinkedIn, GitHub).

### CSS (`css/styles.css`)
Hoja de estilos única dividida en capas lógicas:

1.  **Variables (`:root`)**: Define la paleta de colores (Dark/Light), tipografía (Manrope/Inter) y espaciados.
    *   *Manejo de Temas*: Se usa `[data-theme="light"]` para sobrescribir variables de color (ej. `--bg`, `--text`).
2.  **Reset & Base**: Configuración global de `box-sizing`, márgenes y fuentes.
3.  **Utilities**: Clases `.reveal` (animación de entrada), `.btn-glow`, `.container`.
4.  **Componentes**: Estilos específicos para `.evorix-header`, `.service-pill`, `.dash-module`.
5.  **Media Queries**:
    *   `max-width: 768px`: Breakpoint principal para móviles (ajuste de paddings, menú compacto, grid a columna única).

### JS (`js/main.js`)
Toda la lógica está encapsulada en una **Expression Function Immediately Invoked (IIFE)** o bloques delimitados para evitar contaminar el scope global.

*   **Theme Engine**: Detecta preferencia de sistema o `localStorage` y aplica el atributo `data-theme`.
*   **Pixel Engine (Canvas)**:
    *   Crea partículas (`class Particle` implícita en objetos) que reaccionan al mouse y a la sección actual.
    *   **Modos**: 'Hero' (atracción central), 'Apps' (atracción a nodos), 'Free' (movimiento libre).
*   **Scroll Observer**: Usa `IntersectionObserver` para:
    1.  Activar animaciones `.reveal`.
    2.  Cambiar el modo del Canvas según la sección visible.
    3.  Actualizar el icono activo en el menú de navegación.
*   **Dynamic Services**: Objeto `servicesData` contiene la información (título, intro, bullets, costo). Al hacer clic en un tab, reemplaza el HTML del panel.
*   **EVO Tour**: Función asíncrona que controla el `window.scrollTo` secuencialmente para presentar el sitio.

---

## 4. Tecnologías Explicadas

*   **HTML5**: Uso estricto de etiquetas semánticas (`<section>`, `<article>`, `<nav>`, `<header>`) para accesibilidad y SEO técnico.
*   **CSS3**:
    *   **Custom Properties (Variables)**: Para el cambio instantáneo de temas.
    *   **Flexbox & Grid**: Para los layouts del dashboard y servicios.
    *   **Transitions & Animations**: Para el feedback táctil y efectos de entrada ("Reveal").
*   **Vanilla JavaScript (ES6+)**:
    *   Se eligió para **maximizar el rendimiento** (Lighthouse score alto) y eliminar tiempos de carga de scripts externos.
    *   Permite control total sobre el `RequestAnimationFrame` del Canvas.
*   **Canvas API**: Dibuja el fondo de partículas. Es mucho más performante que animar miles de elementos DOM.
*   **Google Fonts**: *Manrope* (Headings) e *Inter* (Cuerpo) para una estética tech/financiera limpia.

---

## 5. Flujo Interno del Sistema

1.  **Carga Inicial**:
    *   El navegador carga `index.html` y `styles.css`.
    *   `main.js` se ejecuta: Lee `localStorage` para definir si es modo Oscuro o Claro.
    *   Se inicia el loop del Canvas (`requestAnimationFrame`).

2.  **Interacción de Scroll**:
    *   A medida que el usuario baja, el `IntersectionObserver` detecta cuando una sección (`.section`) entra en el viewport (umbral 15%).
    *   Se añade la clase `.in` a los elementos `.reveal`, disparando su transición CSS (fade up).

3.  **Navegación por Servicios**:
    *   Usuario hace click en "Contabilidad Mensual".
    *   JS captura el evento, busca la data en `servicesData['contabilidad']`.
    *   Aplica clase `.fade-out` al panel -> Espera 300ms -> Inyecta nuevo HTML -> Aplica `.fade-in`.

4.  **Contacto**:
    *   Los botones de "WhatsApp" o "Contacto" generan enlaces dinámicos con `mailto:` o `https://wa.me/` pre-llenados con mensajes de contexto.

---

## 6. Puntos Críticos (NO ROMPER)

*   **IDs de DOM**: El JS busca elementos específicos por ID. **No cambiar ni eliminar**:
    *   `#evorix-canvas` (Rompe todo el fondo).
    *   `#panel-title`, `#panel-content-wrapper` (Rompe la sección de servicios).
    *   `#inicio`, `#ecosistema` (Rompe la detección de modo del canvas).
*   **Estructura de `servicesData`**: Si añades un servicio en el HTML (`data-service="nuevo"`), DEBES añadir la clave correspondiente en el objeto `servicesData` en `main.js`.
*   **Clases de Tema**: El CSS depende de `html[data-theme="light"]`. No usar clases en el body para el tema, siempre en `html`.
*   **Z-Index**: El Canvas debe mantenerse en `z-index: -1`. El Header en `z-index: 20` o superior.

---

## 7. Notas para Desarrolladores

### Cómo agregar una nueva sección
1.  Crear la etiqueta `<section id="nuevo-id" class="section">` en `index.html`.
2.  Añadir elementos con la clase `.reveal` para que se animen al entrar.
3.  Si requiere ícono en el menú, añadirlo en `<nav>` con `data-target="#nuevo-id"`.

### Cómo extender el sistema Reveal
Simplemente añade la clase `reveal` a cualquier elemento HTML. Si quieres delay, añade `delay-1`, `delay-2`, o `delay-3`.
```html
<div class="card reveal delay-2">...</div>
```

### Cómo modificar el Dashboard (Ecosistema)
El Grid usa CSS Grid. Para cambiar el layout, edita `.grid-dashboard` en `styles.css`.
*   `grid-template-columns: repeat(12, 1fr)` en desktop.
*   Los elementos usan `grid-column: span X` para definir su ancho.

### Optimización del Canvas
El número de partículas se ajusta dinámicamente en `main.js`:
```javascript
const count = (width < 768) ? 80 : 180;
```
Si el rendimiento baja en móviles antiguos, reduce el valor `80`.

---

## 8. Créditos

**Construido por Rick — EVORIX**
Diseño, arquitectura, animaciones y experiencia creadas para representar la esencia del ecosistema EVORIX.
*Este software es propiedad de Erick Domínguez y está diseñado para su marca personal y operativa.*
