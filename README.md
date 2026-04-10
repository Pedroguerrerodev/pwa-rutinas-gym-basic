# KINETIC

MVP de una PWA mobile-first para gestión de rutinas de gimnasio sin registro para socios, con panel admin, catálogo por disciplinas, búsqueda y progreso guardado en el dispositivo.

## Estado actual

- Base del proyecto creada con React + TypeScript + Vite.
- Base navegable ya implementada para socio y admin.
- Dev server inicial funcionando en local.
- Las skills del proyecto ya están instaladas en carpeta local oculta del workspace.
- Build de producción validada correctamente.
- Base PWA endurecida con manifest, service worker y assets de instalación móvil.

## PWA e instalación

Este proyecto está orientado a que el usuario lo instale en el móvil. Para que eso funcione de verdad, hacen falta manifest, service worker activo, iconos válidos y entrega por HTTPS en producción.

### Estado PWA actual

- Manifest enlazado en [index.html](index.html).
- Service worker registrado en [src/main.tsx](src/main.tsx).
- Service worker con cache de shell y fallback de navegación SPA en [public/sw.js](public/sw.js).
- Iconos PWA dedicados definidos en [public/manifest.webmanifest](public/manifest.webmanifest).
- Script para regenerar assets en npm run pwa:assets.

### Límite real que no depende del código

- En escritorio local, localhost permite service worker.
- En un móvil físico, para instalar la app necesitas servirla por HTTPS.
- Abrir la app desde una IP local del ordenador en la WiFi no garantiza instalación, porque el navegador móvil exige contexto seguro.

### Solución recomendada para probar instalación real

1. Desplegar una preview en Vercel o Netlify.
2. Abrir esa URL HTTPS desde el móvil.
3. Instalar desde Chrome o Safari con Añadir a pantalla de inicio.

### Soluciones de recorte si hicieran falta

1. Mantener esta PWA manual, sin plugin, que ya cubre manifest, service worker e iconos.
2. Si quieres una PWA más automatizada con Workbox y precache avanzado, bajar de Vite 8 a Vite 7 para usar vite-plugin-pwa estable.
3. Si iPhone es prioridad absoluta, reforzar la capa iOS con más iconos y splash screens dedicadas.

## Skills instaladas

Estas skills quedaron instaladas a nivel de proyecto dentro de la carpeta oculta .agents/skills:

- [.agents/skills/frontend-design/SKILL.md](.agents/skills/frontend-design/SKILL.md)
- [.agents/skills/vercel-react-best-practices/SKILL.md](.agents/skills/vercel-react-best-practices/SKILL.md)
- [.agents/skills/supabase-postgres-best-practices/SKILL.md](.agents/skills/supabase-postgres-best-practices/SKILL.md)

Si no ves .agents en el explorador de VS Code, activa la visualización de archivos ocultos.

## Objetivo del MVP

La app debe cubrir dos superficies:

- Socio: explorar rutinas por categoría, buscar por nombre, abrir la rutina y guardar pesos, repeticiones o tiempos en local.
- Admin: crear categorías, ejercicios y rutinas en formato texto y publicar cambios para todos.

## Decisiones funcionales ya tomadas

- Sin registro para socios.
- Login simple para admin con Supabase Auth.
- Biblioteca pública de rutinas por disciplina y objetivo.
- El acceso admin vive en una ruta separada del flujo público de socios.
- Categorías administrables desde el panel para soportar 10-12 disciplinas o más.
- Rutinas y ejercicios definidos solo con texto, métricas y notas en esta fase.
- Vídeo opcional a futuro, no necesario para el MVP.
- Coste orientado a free tier de Supabase y despliegue estático, no a infraestructura propia.

## Stack previsto

- Frontend: React + TypeScript + Vite.
- Navegación: React Router.
- Backend y auth: Supabase.
- Persistencia local del socio: localStorage.
- PWA: manifest + caché offline básico.
- UI: componentes custom con estética premium oscura inspirada en app nativa móvil.

## Roadmap inmediato

1. Refinar el constructor de rutinas con edición de orden y plantillas.
2. Añadir métricas y actividad real al home del socio.
3. Mejorar la estrategia offline cuando el plugin PWA sea compatible con Vite 8.
4. Endurecer todavía más el flujo admin si más adelante hay múltiples administradores.

## Estructura prevista

La estructura final tenderá a organizarse así:

```text
src/
  app/
  components/
  features/
    member/
    admin/
  lib/
  data/
supabase/
  migrations/
public/
```

## Comandos útiles

```bash
npm install
npm run pwa:assets
npm run dev
npm run build
npm run preview
```

## Supabase nuevo

Se ha creado un proyecto nuevo y separado del existente para este MVP. No se ha modificado tu proyecto anterior.

- Project id: hmlfgzicfjhefbxzbiab
- URL: https://hmlfgzicfjhefbxzbiab.supabase.co
- Ruta admin local de la app: [src/app/routes.ts](src/app/routes.ts)

### Estado actual del admin

- El portal admin ya usa Supabase Auth real con login por email y contraseña.
- La ruta pública y la ruta admin están separadas; el acceso admin vive fuera del flujo del socio.
- El panel ya permite CRUD real sobre categorías, ejercicios, rutinas y bloques de rutina.
- La fase actual es solo texto: sin imágenes, GIFs ni media en el flujo operativo.
- El primer usuario autenticado que entre al portal se auto-registra como admin del proyecto.
- A partir de ese momento, solo usuarios presentes en la tabla public.admin_users pueden gestionar contenido.

## Notas sobre las skills

La primera instalación se hizo sin copia física y en Windows no dejó la carpeta visible en el proyecto. Se corrigió reinstalando con copia local al workspace. Por eso ahora sí aparecen dentro de .agents/skills.

## Siguiente paso de implementación

El siguiente bloque de trabajo es rematar la experiencia de edición de rutinas desde el panel admin y pulir el catálogo público con datos más vivos.
