# KINETIC

KINETIC es una PWA mobile-first para gimnasio con área pública para socios y portal admin para gestionar el catálogo de ejercicios y rutinas.

Este proyecto forma parte del Trabajo de Fin de Máster en Desarrollo con IA y nace de un caso real vinculado a DestinoFit, gimnasio de mi localidad ([destinofit.es](https://destinofit.es)) y también proyecto desarrollado por mí. La PWA se ha trabajado en paralelo con el objetivo de digitalizar la entrega, consulta y seguimiento básico de rutinas de entrenamiento desde el móvil, dentro de una necesidad real detectada en el propio gimnasio. Aunque todavía no está siendo utilizada por clientes reales por falta de tiempo para completar su implantación, el proyecto está planteado como una solución funcional, demostrable y orientada a uso real. El desarrollo se ha realizado con apoyo de ChatGPT 5.4 como herramienta principal de asistencia en programación, documentación y validación técnica.

## Descripción general del proyecto

El proyecto surge a partir de una necesidad real detectada en DestinoFit. El gimnasio trabajaba con rutinas en PDF, copias físicas y envíos por WhatsApp, lo que hacía más difícil mantener el contenido actualizado, ordenar rutinas para distintos niveles y consultar el entrenamiento de forma cómoda durante la sesión.

Además, una parte importante de las personas que solicitaban este servicio eran usuarios de mayor edad. Por eso se priorizó una solución sencilla de abrir, instalar y utilizar, sin obligar a descargar una app desde Play Store o App Store ni a pasar por procesos técnicos innecesarios.

KINETIC centraliza esa experiencia en una app web instalable, rápida y pensada para móvil. El producto se divide en dos superficies:

- Área pública para socios.
- Portal admin para el equipo del gimnasio.

La parte pública permite explorar rutinas, guardarlas como favoritas, abrir entrenamientos, registrar marcas por serie y almacenar récords personales en el propio dispositivo sin necesidad de crear una cuenta. El portal admin permite que solo los monitores del gimnasio creen, editen y publiquen rutinas, de modo que el contenido mostrado al socio esté supervisado por profesionales.

## Objetivos del proyecto

### Objetivo académico

Desarrollar una aplicación original que demuestre los conocimientos adquiridos durante el máster, aplicando una arquitectura moderna de frontend, persistencia de datos, autenticación, gestión de estado y despliegue de un producto usable de principio a fin.

### Objetivo funcional

Construir una solución real para gimnasio que permita:

- Consultar rutinas desde el móvil de forma clara y rápida.
- Mantener el progreso del socio en local sin fricción de registro.
- Gestionar categorías, ejercicios y rutinas desde un panel admin.
- Ofrecer una experiencia instalable tipo app mediante PWA.

## Propuesta de valor

- Nace de un caso real y de una necesidad operativa concreta de un gimnasio.
- No requiere registro para el socio.
- Se puede instalar desde el navegador como aplicación, sin depender de tiendas.
- Está diseñada con enfoque mobile-first y con especial atención a la facilidad de uso.
- Permite entrenar y guardar progreso localmente.
- Facilita la actualización del catálogo desde un panel de administración controlado por profesionales.
- Presenta un MVP funcional, defendible y listo para demostración.

## Stack tecnológico

### Frontend

- React 19
- TypeScript
- Vite 8
- React Router 7
- CSS propio
- lucide-react para iconografía

### Datos y backend

- Supabase para autenticación y base de datos del portal admin
- localStorage para progreso, favoritas y récords personales del socio

### Utilidades

- jsPDF para exportación de récords personales en PDF
- Sharp para generación de assets PWA

## Instalación y ejecución

### Requisitos previos

- Node.js 20 o superior recomendado
- npm

### Instalación

```bash
npm install
```

### Variables de entorno

Revisa estos archivos:

- [`.env.example`](.env.example)
- [`.env.local`](.env.local)

Variables utilizadas:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Notas importantes:

- La parte pública puede mostrar contenido desde Supabase o, si no hay credenciales disponibles, usar datos mock.
- El portal admin requiere Supabase configurado correctamente para autenticación y operaciones CRUD.

### Desarrollo local

```bash
npm run dev
```

### Build de producción

```bash
npm run build
```

### Vista previa del build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

### Tests

```bash
npm run test
npm run test:run
```

### Comprobación general

```bash
npm run check
```

### Generación de assets PWA

```bash
npm run pwa:assets
```

## Arquitectura y funcionamiento

La aplicación está construida como frontend SPA con React Router y separación clara entre la experiencia pública y el portal admin.

- La configuración de rutas vive en [src/app/router.tsx](src/app/router.tsx).
- El cliente de Supabase se centraliza en [src/lib/supabase.ts](src/lib/supabase.ts).
- El catálogo público se obtiene desde [src/features/member/hooks/usePublicCatalog.ts](src/features/member/hooks/usePublicCatalog.ts).
- El estado local del entrenamiento se gestiona desde [src/features/member/state/localProgress.ts](src/features/member/state/localProgress.ts).
- La autenticación y control de acceso admin se apoyan en [src/features/admin/auth/AdminAuthContext.tsx](src/features/admin/auth/AdminAuthContext.tsx).
- Las operaciones del panel admin se concentran en [src/features/admin/hooks/useAdminCatalog.ts](src/features/admin/hooks/useAdminCatalog.ts).

### Modelo de datos funcional

- El socio no necesita autenticarse.
- Las rutinas públicas se consumen desde Supabase cuando hay entorno configurado.
- Si no hay entorno, la app pública puede apoyarse en datos mock para facilitar desarrollo o demo básica.
- El progreso del socio se guarda en localStorage por rutina.
- Los récords personales se guardan en localStorage de forma persistente e independiente del catálogo.
- El panel admin sí requiere autenticación real con Supabase.

## Estructura del proyecto

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
      auth/
      hooks/
      pages/
    member/
      components/
      hooks/
      pages/
      state/
  lib/
public/
  manifest.webmanifest
  sw.js
scripts/
supabase/
  migrations/
```

### Organización principal

- `src/app`: arranque de la app, router y layouts.
- `src/components`: componentes compartidos de interfaz.
- `src/data`: datos mock y tipos base del catálogo público.
- `src/features/member`: experiencia del socio, páginas públicas y estado local.
- `src/features/admin`: autenticación, hooks y páginas del portal admin.
- `src/lib`: integraciones compartidas, como Supabase.
- `public`: assets estáticos, manifest e implementación del service worker.
- `scripts`: utilidades del proyecto, como generación de assets PWA.
- `supabase/migrations`: esquema y evolución de base de datos.

## Funcionalidades principales

### Área pública para socios

- Home orientada a onboarding y a instalación de la PWA.
- Explorador de rutinas con búsqueda por nombre y filtros por categoría.
- Vista de entrenamiento optimizada para móvil.
- Soporte para rutinas de 1 a 7 días.
- Registro de valor por serie.
- Marcado de series completadas.
- Guardado de récord personal por ejercicio.
- Persistencia local del progreso del entrenamiento.
- Sección de progreso con listado de récords personales.
- Búsqueda de récords guardados.
- Exportación de récords personales en PDF.
- Guardado de rutinas favoritas en el dispositivo.

### Portal admin

- Inicio de sesión mediante Supabase Auth.
- Control de acceso con tabla `admin_users`.
- Alta de administradores controlada desde base de datos.
- CRUD de categorías.
- CRUD de ejercicios.
- CRUD de rutinas.
- Gestión de bloques de ejercicios por rutina y por día.
- Publicación y visibilidad de rutinas para el catálogo público.

## Experiencia de uso

### Experiencia del socio

- La home está orientada a onboarding inmediato y a la instalación de la app en Android o iPhone.
- El explorador permite buscar rutinas por nombre y filtrarlas por categoría.
- La pantalla de entrenamiento está pensada para uso real durante la sesión en móvil.
- La sección de progreso reúne los récords personales guardados en el dispositivo.

### Experiencia del admin

- El portal admin concentra toda la gestión del catálogo.
- Permite crear y editar categorías, ejercicios y rutinas desde una misma interfaz.
- Soporta la organización de rutinas por días para reflejar mejor la estructura real del entrenamiento.
- El contenido publicado queda disponible automáticamente para la parte pública.

## Decisiones clave de producto

- El socio no necesita registrarse para utilizar la aplicación.
- El progreso del entrenamiento se guarda en local para reducir fricción.
- Solo el equipo del gimnasio puede crear y publicar rutinas.
- El portal admin sí utiliza autenticación real con Supabase.
- La experiencia pública prioriza lenguaje claro, navegación simple y bajo esfuerzo técnico para el usuario.
- La instalación PWA forma parte central de la propuesta del producto.

## Rutas principales

### Rutas públicas

- `/`
- `/explorer`
- `/my-routines`
- `/progress`
- `/how-it-works`
- `/routine/:slug`

### Rutas admin

- `/kinetic-admin-portal`
- `/kinetic-admin-portal/login`

Las constantes principales del portal admin están en [src/app/routes.ts](src/app/routes.ts).

## PWA y experiencia móvil

KINETIC está planteada como una Progressive Web App para ofrecer una experiencia cercana a app nativa sin necesidad de publicar en tienda.

Implementación actual:

- Manifest en [public/manifest.webmanifest](public/manifest.webmanifest)
- Registro del service worker en [src/main.tsx](src/main.tsx)
- Service worker en [public/sw.js](public/sw.js)

Características destacadas:

- Instalación guiada desde la home.
- Soporte para instalación manual en iPhone y Android.
- Caché básica del shell de aplicación.
- Enfoque mobile-first en navegación y entrenamiento.

Notas:

- En local, el service worker puede funcionar en `localhost`.
- Para probar instalación real en móvil, la aplicación debe servirse por HTTPS.

## Base de datos y Supabase

El proyecto utiliza Supabase como backend para autenticacion del portal admin, base de datos y control de acceso.

Las migraciones SQL estan organizadas en [`supabase/migrations`](supabase/migrations) y cubren:

- esquema inicial del catalogo y relaciones principales,
- control de acceso para administradores,
- politicas de seguridad para operaciones del portal admin,
- soporte para rutinas organizadas por dias,
- clasificacion adicional de ejercicios,
- datos base para poblar el catalogo inicial.

## Despliegue

El proyecto está preparado para frontend estático con backend Supabase.

Flujo previsto:

1. Configurar variables de entorno.
2. Ejecutar `npm run build`.
3. Desplegar frontend en Vercel.
4. Verificar funcionamiento del panel admin.
5. Validar instalación PWA desde una URL HTTPS pública.

La configuración de rewrites para despliegue está en [vercel.json](vercel.json).

## Estado actual del proyecto

Estado del MVP:

- App pública funcional.
- Portal admin funcional con Supabase.
- Instalación PWA guiada desde la home.
- Rutinas multidía operativas.
- Progreso local del socio implementado.
- Récords personales persistentes en el dispositivo.
- Exportación de récords personales en PDF.
- Validación de datos en el portal admin.
- Tests automatizados sobre lógica crítica del proyecto.
- Proyecto preparado para generar build de producción.

En conjunto, el proyecto queda en un estado válido para demostración, revisión académica y presentación como proyecto final del máster.

## Calidad técnica aplicada

Como parte del cierre del proyecto se han reforzado varios aspectos orientados a entrega académica y mantenibilidad:

- Validación de datos en formularios clave del portal admin.
- Tests automatizados sobre lógica de progreso local, favoritas, citas diarias y validación admin.
- Script de comprobación general con `npm run check`.
- Separación entre catálogo público, estado local del socio y gestión autenticada del portal admin.
- Control de acceso admin apoyado en Supabase y tabla `admin_users`.

## Estado final para la entrega

El proyecto queda preparado para una entrega académica en la que se pueda valorar con claridad:

- una propuesta de producto real y coherente,
- una aplicación funcional con área pública y portal admin,
- uso de tecnologías actuales de frontend,
- persistencia local y backend real con Supabase,
- validación, tests y build de producción verificados.

## Autoría

Desarrollado por Pedro Guerrero Pinta como proyecto final del máster, con foco en producto real, experiencia móvil y aplicación práctica de desarrollo asistido con IA. Todo el proyecto se ha trabajado con ChatGPT 5.4 como herramienta principal de apoyo durante el proceso de diseño, implementación, documentación y revisión.
