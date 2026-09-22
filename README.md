# Flores amarillas para mi esposa 🌼

Sitio estático romántico e interactivo en español para pedir disculpas por olvidar el Día de las Flores Amarillas y celebrar el amor.

## Qué incluye

- Landing page responsive y mobile-first.
- Jardín de flores amarillas animadas (HTML/CSS/JS sin imágenes externas obligatorias).
- Botón para abrir/cerrar una carta de amor.
- Botón para hacer florecer más flores y activar lluvia de pétalos.
- Contador accesible de flores regaladas.
- Sección editable de razones/promesas.
- Soporte de accesibilidad: HTML semántico, foco visible, navegación por teclado, `aria-live` y `prefers-reduced-motion`.
- Favicon SVG local.

## Ejecutar localmente

No requiere build.

### Opción rápida
Abre `index.html` directamente en tu navegador.

### Opción recomendada (servidor local)
Desde la raíz del repositorio:

```bash
python3 -m http.server 8080
```

Luego visita: `http://localhost:8080/`

## Personalización rápida

Edita estos archivos:

- `index.html`: mensaje de disculpa, carta y lista de razones/promesas.
- `styles.css`: colores, tipografía y estilo visual.
- `script.js`: comportamiento de botones, contador y animaciones.

## Publicación en GitHub Pages

Este repositorio incluye el workflow:

- `.github/workflows/pages.yml`

El despliegue se ejecuta al hacer push a `main` usando:

- `actions/configure-pages`
- `actions/upload-pages-artifact`
- `actions/deploy-pages`

### Pasos en GitHub

1. Ve a **Settings → Pages**.
2. En **Build and deployment**, selecciona **Source: GitHub Actions**.
3. Haz merge de cambios a `main`.
4. Espera que finalice el workflow **Deploy static site to Pages**.

El sitio quedará publicado en la URL de Pages del repositorio.
