# Flores amarillas para mi esposa 🌼

Sitio estático romántico e interactivo en español para pedir disculpas por olvidar el Día de las Flores Amarillas y celebrar el amor.

## Qué incluye

- Landing page responsive y mobile-first.
- Jardín de flores amarillas animadas (HTML/CSS/JS sin imágenes externas obligatorias).
- Abejas y frases románticas al tocar flores/elementos del jardín.
- Botón para abrir/cerrar una carta de amor.
- Botón para hacer florecer más flores y activar lluvia de pétalos.
- Contador accesible de flores regaladas.
- Botón **“Elegir fotos de Google Fotos”** para usar Google Photos Picker API y mostrar únicamente fotos seleccionadas por el usuario.
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

Si necesitas probar exactamente el origen solicitado en OAuth:

```bash
python3 -m http.server 5500
```

Luego visita: `http://localhost:5500/`

## Configurar Google Photos Picker API (OAuth para app estática)

> **Nunca subas un Client Secret al repositorio.**
> Este proyecto usa solo un **OAuth Client ID público** en frontend.

1. En Google Cloud Console, crea o abre tu proyecto.
2. Habilita **Google Photos Picker API**.
3. Crea credenciales OAuth para **Aplicación web**.
4. Configura estos **Authorized JavaScript origins** exactamente:
   - `https://tofferioao.github.io`
   - `http://localhost:5500`
5. Usa únicamente el **Client ID** (termina en `.apps.googleusercontent.com`).
6. No uses cuentas de servicio para Google Photos Picker.

### Flujo implementado en la página

- El usuario pulsa **Elegir fotos de Google Fotos**.
- Se solicita consentimiento OAuth en el navegador.
- Se crea una sesión Picker (`/v1/sessions`) y se abre `pickerUri`.
- Solo se listan fotos elegidas por el usuario (`/v1/mediaItems?sessionId=...`).
- Si no autoriza o cancela, se mantiene el fallback local/placeholder.

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
