# ⛅ Mi Clima

Aplicación web de clima que muestra el tiempo actual y el pronóstico de 7 días. Permite buscar cualquier ciudad del mundo y usa tu ubicación automáticamente si lo autorizas.

## Características

- 🌍 Búsqueda de ciudades por nombre (geocodificación en español)
- 📍 Geolocalización automática al abrir la app (con respaldo a Buenos Aires)
- ⛅ Clima actual: temperatura, descripción, humedad y viento
- 📅 Pronóstico de 7 días con temperatura máxima y mínima
- 🇪🇸 Interfaz y datos totalmente en español

## Tecnologías

- [React](https://react.dev) + [Vite](https://vite.dev)
- [Open-Meteo](https://open-meteo.com) (geocodificación y pronóstico, sin API key)
- [Oxlint](https://oxc.rs) para linting

## Cómo ejecutar

```bash
npm install
npm run dev
```

## Scripts

| Comando          | Descripción                     |
| ---------------- | ------------------------------- |
| `npm run dev`    | Inicia el servidor de desarrollo |
| `npm run build`  | Compila la app para producción  |
| `npm run preview`| Previsualiza la compilación     |
| `npm run lint`   | Ejecuta Oxlint                  |

## Despliegue

Puedes publicar la app como un sitio estático en [GitHub Pages](https://pages.github.com), [Vercel](https://vercel.com) o [Netlify](https://www.netlify.com), ya que solo necesita una carpeta estática (`dist`).