# Pointer

Point your phone at any town or address — an arrow shows you the way.

**Live: https://wannesdebacker.github.io/pointer/**

Small [SolidJS](https://www.solidjs.com/) app using the device compass + GPS:

- Search with OpenStreetMap (Nominatim) autocomplete
- Tilt-compensated compass (works flat or upright, Android + iOS)
- Live distance & bearing, glows when you're aligned

## Dev

```sh
npm install
npm run dev
```

Compass + geolocation require HTTPS (or localhost).

Push to `main` → GitHub Actions builds and deploys to GitHub Pages.
