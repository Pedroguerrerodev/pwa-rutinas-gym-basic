# KINETIC · README de producto

## Qué es

KINETIC es una app web instalable para gimnasio orientada a móvil. Permite que un socio abra la app, encuentre una rutina, entrene y guarde sus marcas en el propio dispositivo sin tener que registrarse.

El producto tiene dos superficies:

- Área pública para socios.
- Portal admin para el equipo del gimnasio.

## Problema que resuelve

Muchos gimnasios siguen compartiendo rutinas con PDFs, notas sueltas o mensajes. Eso hace que la experiencia sea poco clara, difícil de actualizar y poco práctica para el socio.

KINETIC centraliza la experiencia en una app rápida, instalable y simple de usar.

## Propuesta de valor

- No exige registro al socio.
- Se puede instalar como app desde el navegador.
- Permite entrenar y guardar marcas localmente.
- Facilita al gimnasio actualizar rutinas desde un panel admin.
- Ofrece una experiencia móvil clara y directa.

## Experiencia del socio

### Inicio

La home está pensada para onboarding inmediato:

- Explica cómo instalar la app en Android y iPhone.
- Explica cómo se guarda el progreso en el dispositivo.
- Da acceso rápido al catálogo y a rutinas destacadas.

### Explorar

- Búsqueda por nombre de rutina.
- Filtros por categoría.
- Presentación más clara de las rutinas.
- Mensaje de confianza: rutinas supervisadas por profesionales.

### Entrenamiento

- Vista optimizada para móvil.
- Soporte para rutinas de 1 a 7 días.
- Campo Tu marca por serie.
- Check de serie completada.
- Botón PR para marcar récord personal.

### Progreso

La pestaña Progreso está centrada en récords personales:

- Lista de PR guardados.
- Buscador para muchos registros.
- Fecha del PR en formato español.
- Acceso directo a la rutina relacionada.

## Experiencia del admin

El portal admin permite:

- Crear y editar categorías.
- Crear y editar ejercicios.
- Crear y editar rutinas.
- Montar rutinas por días.
- Publicar contenido para todos los socios.

## Decisiones de producto ya tomadas

- Sin registro para socios.
- Admin autenticado con Supabase.
- Catálogo público de rutinas.
- Lenguaje no técnico en la UI pública.
- Instalación PWA como eje principal de la home.
- Persistencia local del progreso del socio.

## Funcionalidades destacadas ya implementadas

- PWA instalada desde navegador.
- Rutinas multidía.
- Catálogo base de ejercicios sembrado en base de datos.
- PR por ejercicio.
- Un único PR activo por ejercicio.
- PR persistentes incluso si la rutina desaparece del catálogo.

## Público objetivo

- Gimnasios que quieren digitalizar sus rutinas sin desarrollar una app nativa.
- Socios que entrenan desde el móvil y quieren una experiencia simple.
- Equipos que necesitan editar rutinas sin tocar código.

## Estado del producto

El MVP ya es demostrable y usable:

- El socio puede instalar, explorar, entrenar y guardar progreso.
- El admin puede gestionar el contenido real.
- La app ya transmite una propuesta clara para enseñar el proyecto.

## Siguientes pasos naturales

1. Añadir más contexto visual al progreso.
2. Mejorar la lectura temporal de los PR con etiquetas como Hoy o Ayer.
3. Añadir más señales de avance en Inicio o Rutina.
4. Seguir refinando el tono comercial y la presentación del producto.