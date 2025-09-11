# EVORIX — Landing (Versión V3)

Esta versión mejora la navegación y el estilo respecto a versiones anteriores. Está pensada para usar un tema claro por defecto y un tema oscuro opcional, además de transiciones suaves y estructura ligera.

## Cambios principales

- **Tema claro por defecto** con un botón de alternancia para activar el modo oscuro (persistente con `localStorage`).
- **Animaciones ligeras** de aparición secuencial con `IntersectionObserver`, evitando pesadas librerías de animaciones.
- **Hero con video opcional**: Coloca tu video en `assets/videos/hero.mp4` y una imagen de póster en `assets/images/hero-poster.jpg`. Si no existen, se muestra un color degradado.
- **Diseño limpio** y aireado, con tipografía clara y espaciados definidos.
- **Rutas relativas** para que funcione con doble clic (en el sistema de archivos) o en servidores estáticos.
- **Archivos bien comentados** indicando dónde modificar textos, imágenes y videos.

## Estructura

- `/css/styles.css`: Archivo CSS con variables para colores, tipografías y estilos. Aquí puedes ajustar la paleta y radii.
- `/js/main.js`: JavaScript para alternar temas, animaciones de aparición y manejo del formulario.
- `index.html`: Página principal con hero, secciones y formulario de contacto.
- `certificaciones.html`, `casos.html`, `privacy.html`: Páginas secundarias. Edita su contenido como necesites.
- `assets/images` y `assets/videos`: Directorios para tus imágenes y videos. Incluye archivos README para guiarte.

**Fecha de generación:** 2025-09-10

