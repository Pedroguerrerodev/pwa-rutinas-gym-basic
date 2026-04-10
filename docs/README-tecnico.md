# KINETIC · README técnico

## Stack técnico

- React 19
- TypeScript
- Vite 8
- React Router 7
- Supabase
- localStorage para progreso del socio
- lucide-react para iconografía

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run pwa:assets
```

## Variables de entorno

Revisa estos archivos:

- [.env.example](../.env.example)
- [.env.local](../.env.local)

Las credenciales de Supabase deben definirse ahí para trabajar en local.

## Estructura principal

```text
src/
  app/
    routes.ts
    router.tsx
    shells/
  components/
  data/
  features/
    admin/
    member/
  lib/
public/
  manifest.webmanifest
  sw.js
supabase/
  migrations/
scripts/
```

## Rutas de la app

- Home: `/`
- Explorar: `/explorer`
- Progreso: `/progress`
- Rutina: `/routine/:slug`
- Admin: `/kinetic-admin-portal`
- Login admin: `/kinetic-admin-portal/login`

Las constantes admin están en [src/app/routes.ts](../src/app/routes.ts).

## Páginas principales

- [src/features/member/pages/HomePage.tsx](../src/features/member/pages/HomePage.tsx)
- [src/features/member/pages/ExplorerPage.tsx](../src/features/member/pages/ExplorerPage.tsx)
- [src/features/member/pages/WorkoutPage.tsx](../src/features/member/pages/WorkoutPage.tsx)
- [src/features/member/pages/HowItWorksPage.tsx](../src/features/member/pages/HowItWorksPage.tsx)
- [src/features/admin/pages/AdminDashboardPage.tsx](../src/features/admin/pages/AdminDashboardPage.tsx)
- [src/features/admin/pages/AdminLoginPage.tsx](../src/features/admin/pages/AdminLoginPage.tsx)

## PWA

Implementación actual:

- Manifest enlazado en [index.html](../index.html)
- Registro del service worker en [src/main.tsx](../src/main.tsx)
- Service worker en [public/sw.js](../public/sw.js)
- Manifest en [public/manifest.webmanifest](../public/manifest.webmanifest)

Notas reales:

- En localhost el service worker puede funcionar.
- La instalación real en móvil exige HTTPS.
- La guía de instalación vive en la home pública.

## Progreso local

El progreso del socio no se guarda en Supabase. Se guarda en localStorage.

### Qué se guarda

- Valores por serie.
- Series completadas.
- PR por ejercicio.
- Registro persistente de PR independiente del catálogo.

### Reglas actuales

- Un ejercicio solo puede tener un PR activo.
- Si se marca un nuevo PR del mismo ejercicio, reemplaza al anterior.
- Si una rutina desaparece del catálogo, el PR sigue existiendo en Progreso.

### Capacidad aproximada

localStorage suele ofrecer alrededor de 5 MB por dominio. Para este tipo de datos de texto corto es suficiente durante bastante tiempo.

## Supabase

Proyecto asociado:

- Project id: `hmlfgzicfjhefbxzbiab`
- URL: `https://hmlfgzicfjhefbxzbiab.supabase.co`

## Migraciones actuales

- `20260409_kinetic_initial_schema.sql`
- `20260409_kinetic_admin_access_control.sql`
- `20260409_kinetic_admin_policies.sql`
- `20260410_kinetic_exercise_muscle_group.sql`
- `20260410_kinetic_routine_exercise_days.sql`
- `20260410_kinetic_seed_base_exercises.sql`

## Estado del portal admin

- Auth real con Supabase.
- Alta automática del primer admin autenticado.
- Control de acceso con `admin_users`.
- CRUD de categorías, ejercicios y rutinas.
- Rutinas agrupadas por día mediante `day_number`.

## Despliegue

El proyecto está preparado para frontend estático con backend Supabase.

Flujo usado:

- Vercel para frontend.
- Supabase para base de datos y autenticación.

Pasos típicos:

1. Configurar variables de entorno.
2. Ejecutar `npm run build`.
3. Desplegar frontend en Vercel.
4. Verificar que la URL pública use HTTPS para probar instalación PWA.

## Validación mínima antes de subir cambios

```bash
npm run build
```

## Skills del proyecto

Skills disponibles en `.agents/skills`:

- `.agents/skills/frontend-design/SKILL.md`
- `.agents/skills/vercel-react-best-practices/SKILL.md`
- `.agents/skills/supabase-postgres-best-practices/SKILL.md`