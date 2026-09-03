# ⛅ Mi Clima

Aplicación web de clima que muestra el tiempo actual, el pronóstico por horas y de 7 días. Permite buscar cualquier ciudad del mundo y usa tu ubicación automáticamente si lo autorizas.

## Despliegue

La app está publicada en producción en **Vercel**:

- 🔗 https://clima-app-ruby.vercel.app/

## Características

- 🌍 Búsqueda de ciudades por nombre (geocodificación en español)
- 📍 Geolocalización automática al abrir la app (con respaldo a Santiago de Chile)
- ⛅ Clima actual: temperatura, descripción, humedad y viento
- ⏰ Pronóstico de las próximas 24 horas con probabilidad de lluvia
- 📅 Pronóstico de 7 días con temperatura máxima y mínima
- 📈 Gráficos de temperatura (por hora y por día)
- ⭐ Ciudades favoritas y historial de búsquedas recientes
- 💾 Persistencia local de favoritos, historial y preferencias
- 🌓 Modo oscuro y claro (manual o automático)
- 🌐 Interfaz en español o inglés (detecta el idioma del navegador, con selector manual)
- 🌡️ Unidades métricas (°C, km/h) o imperiales (°F, mph)
- 🍃 Calidad del aire (índice europeo EAQI)
- 🔍 Autocompletado de ciudades al buscar
- ⚖️ Comparar el clima entre dos ciudades

## Tecnologías

- [React](https://react.dev) + [Vite](https://vite.dev)
- [Open-Meteo](https://open-meteo.com) (geocodificación, pronóstico y calidad del aire, sin API key)
- [Recharts](https://recharts.org) para gráficos
- [i18next](https://www.i18next.com) + [react-i18next](https://react.i18next.com) para internacionalización
- [Vitest](https://vitest.dev) para tests
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
| `npm test`       | Ejecuta los tests con Vitest    |

## Despliegue local

El proyecto es un sitio estático: para publicarlo en [GitHub Pages](https://pages.github.com), [Vercel](https://vercel.com) o [Netlify](https://www.netlify.com), solo se necesita compilar y subir la carpeta `dist`.