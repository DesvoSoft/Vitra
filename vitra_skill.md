# Skill para Agentes: Vitra CSS Framework

Vitra CSS es un framework de diseño premium centrado en la estética **glassmorphism**, el rendimiento y la facilidad de uso. Este documento sirve como guía de contexto para que agentes de IA puedan construir interfaces modernas y coherentes utilizando Vitra.

## 🚀 Conceptos Core

1.  **Glassmorphism Primero**: La identidad visual se basa en efectos de cristal esmerilado, bordes sutiles y capas de profundidad.
2.  **Sistema de Temas**: Soporte nativo para `light`, `dark`, y `auto` (basado en el sistema), además de temas especiales como `neon`, `ocean`, etc.
3.  **Tokens de Diseño**: Todo el framework utiliza variables CSS (tokens) con el prefijo `--vitra-`.
4.  **Capa de Movimiento**: Animaciones fluidas utilizando curvas de Bézier personalizadas (como `cubic-bezier(0.23, 1, 0.32, 1)` para efectos de lujo).

## 🛠 Instalación y Setup

Para usar Vitra, recomendamos utilizar la red de distribución jsDelivr. Incluye los archivos consolidados y minificados (`.min`) asegurando la versión e integridad (SRI).

```html
<!-- Core CSS (Ejemplo apuntando a la versión fija 1.2.0) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@1.2.0/dist/vitra.min.css" integrity="sha256-RV2dZNi+HJxvKeb8AdDrsZV1mWz6oqAMSneODNdsIl0=" crossorigin="anonymous">

<!-- Core JS -->
<script src="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@1.2.0/dist/vitra.min.js" integrity="sha256-6s2xLqcZaX8RKfLG/tjPjNs/rJuWVgwz+8Lfz662jv8=" crossorigin="anonymous" defer></script>
```

> **Nota para Agentes**: Utiliza siempre versiones fijas (ej. `@1.2.0`) y asegúrate de incluir atributos `integrity` (SRI) en producción. Puedes omitir la versión para obtener `@latest` en entornos de prueba locales. Siempre apunta a los archivos dentro de la carpeta `dist/` (`dist/vitra.min.css` y `dist/vitra.min.js`).

## 💎 Glassmorphism

Aplica el efecto de cristal a cualquier contenedor:

-   `.vitra-glass`: El efecto base (blur medio, borde sutil).
-   Variantes de Blur: `.vitra-glass-sm`, `.vitra-glass-md`, `.vitra-glass-lg`, `.vitra-glass-xl`.
-   Estética Extra: `.vitra-glass-reflect` (añade un degradado de reflejo), `.vitra-glass-subtle`.

## 🎨 Temas y Colores

Vitra usa `data-theme` en el elemento `<html>`.

```javascript
// Cambiar tema programáticamente
Vitra.theme.set('dark');
Vitra.theme.toggle();
```

### Tokens Principales
-   `--vitra-color-accent`: El color de énfasis (por defecto un violeta moderno).
-   `--vitra-color-bg`: Fondo de la aplicación.
-   `--vitra-color-surface`: Color para tarjetas y superficies.

## 🧱 Componentes UI

### Botones (`.vitra-btn`)
-   `.vitra-btn-glass`: Botón translúcido (recomendado).
-   `.vitra-btn-solid`: Botón con color de acento sólido.
-   `.vitra-btn-ghost`: Solo bordes.
-   `.vitra-btn-gradient`: Degradado premium.
-   Tamaños: `.vitra-btn-sm`, `.vitra-btn-lg`.

### Tarjetas (`.vitra-card`)
-   `.vitra-card-glass`: Tarjeta glassmorphism.
-   `.vitra-card-hover`: Añade efecto de elevación al pasar el mouse.
-   Elementos: `.vitra-card-title`, `.vitra-card-body`, `.vitra-card-footer`, `.vitra-card-image`.

### Formas e Inputs (`.vitra-input`)
-   `.vitra-input`: Estilo base elegante.
-   `.vitra-input-glass`: Input translúcido que se mezcla con el fondo.

### Navegación (`.vitra-navbar`)
-   `.vitra-navbar-glass`: Barra de navegación fija con blur.
-   `.vitra-navbar-brand`: Estilo para el logo/nombre.

## 🪄 Animaciones y Efectos

### Partículas
Vitra incluye un sistema de partículas para fondos dinámicos:
```javascript
Vitra.particles.spawn(20, { 
    color: 'var(--vitra-color-accent)', 
    size: 5 
});
```
O vía HTML: `<div data-vitra-particles="15"></div>`

### Scroll Reveal
Añade la clase `.vitra-reveal` a cualquier elemento para que aparezca suavemente al hacer scroll.
```javascript
Vitra.reveal.init({ stagger: 150 });
```

## 🧠 Guía para el Agente (Best Practices)

1.  **Prioriza el Vidrio**: Cuando construyas una UI, usa `.vitra-card-glass` sobre fondos oscuros o con degradados para maximizar el impacto visual.
2.  **Espaciado**: Usa siempre las variables de espacio: `var(--vitra-space-1)` (8px) hasta `var(--vitra-space-8)`.
3.  **Tipografía**: Usa `.vitra-font-heading` (Outfit) para títulos y `.vitra-font-family` (Inter) para cuerpo de texto.
4.  **Interactividad**: Si creas un modal, usa `Vitra.modal.open('id-del-modal')`. No olvides incluir el overlay `.vitra-modal-overlay`.
5.  **Accesibilidad**: Asegúrate de que los botones tengan `aria-label` y los modals tengan los atributos `role="dialog"`.

---
*Vitra CSS Skill - v1.0.0*
