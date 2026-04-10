# KINETIC

KINETIC es una PWA mobile-first para gimnasio con área pública para socios y portal admin para gestionar el catálogo de ejercicios y rutinas.

## Documentación

- Producto: [docs/README-producto.md](docs/README-producto.md)
- Técnica: [docs/README-tecnico.md](docs/README-tecnico.md)

## Estado actual

- App pública funcional.
- Portal admin funcional con Supabase.
- Instalación PWA guiada desde la home.
- Rutinas multidía operativas.
- Progreso local y PRs guardados en el dispositivo.
- Build de producción validada.

## Stack

- React 19
- TypeScript
- Vite 8
- React Router 7
- Supabase
- localStorage para progreso del socio

## Scripts principales

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run pwa:assets
```

## Variables de entorno

Revisa [.env.example](.env.example) y [.env.local](.env.local).

## Rutas clave

- Home: `/`
- Explorar: `/explorer`
- Progreso: `/progress`
- Rutina: `/routine/:slug`
- Admin: `/kinetic-admin-portal`
- Login admin: `/kinetic-admin-portal/login`
