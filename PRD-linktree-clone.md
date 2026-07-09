# PRD — Clon de Linktree (Proyecto de práctica, Vibe Coding)

## 0. Contexto del proyecto

Este documento define los requisitos completos para construir un clon **funcional y dinámico** de Linktree, evitando el error detectado en el video del curso (botones estáticos por plataforma, sin CRUD real).

**Diferenciador clave respecto al ejemplo del curso:**
Los links **no son componentes fijos por red social**. Son registros en base de datos, renderizados por **un solo componente reutilizable** (`LinkButton`), que recibe `título` y `url` como props. Agregar TikTok, un link de WhatsApp, o una tienda en línea es exactamente el mismo flujo: insertar una fila en la tabla `links`.

---

## 1. Visión

Una app web donde cualquier persona puede:
1. Crear una cuenta.
2. Configurar su página pública (foto, nombre, bio, colores).
3. Agregar, quitar y reordenar libremente los links que quiera mostrar.
4. Compartir su página pública (`tuapp.com/su-usuario`) como landing de todos sus enlaces.

---

## 2. Alcance de la v1 (decidido)

| Decisión | Elegido |
|---|---|
| Usuarios | **Multi-usuario** — cada quien se registra y tiene su propia página en `/[username]` |
| Analytics de clics | **No en v1** (queda documentado como v2, ver sección 9) |
| Personalización visual | **Media** — color de fondo y color de botones configurables. Sin temas predefinidos todavía |
| Reordenar links | Sí — MVP con botones ↑↓ (drag-and-drop se deja como mejora v2, ver sección 9) |
| Iconos por plataforma | No en v1 — todos los links usan el mismo estilo de botón genérico |

---

## 3. User Stories

**Autenticación**
- Como visitante, quiero registrarme con correo y contraseña para tener mi propia página.
- Como usuario, quiero iniciar sesión para editar mi contenido.
- Como usuario, quiero elegir un `username` único que será mi URL pública.

**Perfil**
- Como usuario, quiero subir/cambiar mi foto de perfil.
- Como usuario, quiero editar mi nombre visible y mi bio (texto corto).
- Como usuario, quiero elegir el color de fondo de mi página y el color de mis botones.

**Links**
- Como usuario, quiero agregar un link nuevo indicando título y URL.
- Como usuario, quiero eliminar un link que ya no quiero mostrar.
- Como usuario, quiero reordenar mis links (subir/bajar posición).
- Como usuario, quiero poder desactivar un link temporalmente sin borrarlo (opcional v1, útil de bajo costo).

**Página pública**
- Como visitante, quiero entrar a `tuapp.com/usuario` y ver su foto, nombre, bio y todos sus links activos, en el orden que definió.
- Como visitante, quiero que la página se vea bien desde mi celular (la mayoría del tráfico de Linktree es móvil).

---

## 4. Requisitos funcionales

| ID | Requisito |
|---|---|
| RF-01 | Registro e inicio de sesión con Supabase Auth (email + contraseña) |
| RF-02 | Cada usuario tiene un `username` único, validado al crear cuenta o en primer login |
| RF-03 | CRUD de perfil: avatar (upload a Supabase Storage), nombre, bio, color de fondo, color de botón |
| RF-04 | CRUD de links: crear, eliminar, editar título/URL |
| RF-05 | Reordenar links (actualiza campo `position` en base de datos) |
| RF-06 | Componente `LinkButton` único y reutilizable — recibe `title`, `url`, `color` como props. **Ningún link tiene diseño hardcodeado por plataforma** |
| RF-07 | Página pública dinámica en `/[username]`, sin necesidad de login, que lee de Supabase en tiempo real (o al momento del build/request) |
| RF-08 | Dashboard privado (`/dashboard`) protegido — solo accesible logueado, y solo edita los datos del usuario dueño de la sesión |
| RF-09 | Validación básica de URLs al agregar un link (debe empezar con `http://` o `https://`) |
| RF-10 | Avatar circular en la página pública. Al pasar el mouse (hover), hace un flip 3D (efecto moneda): revela un reverso decorativo con las iniciales del username sobre `button_color`. Implementado con CSS puro (`transform-style: preserve-3d`, `backface-visibility: hidden`, `rotateY`), sin librerías externas. En móvil (sin hover), el flip puede activarse con tap — definir en Fase 4 |

## 5. Requisitos no funcionales

| ID | Requisito |
|---|---|
| RNF-01 | **Mobile-first**: la página pública debe verse perfecta en pantallas pequeñas antes que en desktop |
| RNF-02 | Seguridad de datos: Row Level Security (RLS) en Supabase — un usuario nunca puede editar datos de otro, aunque manipule la URL o la API |
| RNF-03 | Tiempo de carga de la página pública corto (evitar librerías pesadas innecesarias) |
| RNF-04 | Código organizado en componentes claros y nombrados de forma entendible (dado que el dueño del proyecto está aprendiendo a leer código) |
| RNF-05 | Deploy reproducible: debe poder hacerse `git push` → Vercel despliega automáticamente |

---

## 6. Tech Stack

Elegido para que calce 1:1 con tus MCPs ya conectados (GitHub, Supabase, Vercel):

- **Frontend + Backend**: Next.js (App Router) — permite páginas dinámicas (`/[username]`) y rutas protegidas en el mismo framework
- **Estilos**: Tailwind CSS (rápido para responsive, estándar en estos proyectos)
- **Base de datos + Auth + Storage**: Supabase (Postgres + Auth + Storage para avatares)
- **Hosting**: Vercel
- **Control de versiones**: GitHub
- **n8n**: no se usa en v1 (no hay automatización necesaria todavía). Se deja pendiente para v2 si quieres, por ejemplo, notificarte por Telegram cuando alguien nuevo se registra

---

## 7. Modelo de datos (Supabase)

### Tabla `profiles`
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | FK a `auth.users.id`, PK |
| username | text | único, indexado |
| display_name | text | |
| bio | text | opcional |
| avatar_url | text | URL en Supabase Storage |
| bg_color | text | hex, default `#ffffff` |
| button_color | text | hex, default `#000000` |
| created_at | timestamp | default now() |

### Tabla `links`
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| profile_id | uuid | FK a `profiles.id` |
| title | text | |
| url | text | |
| position | int | orden de aparición |
| is_active | boolean | default true |
| created_at | timestamp | default now() |

### RLS (reglas clave)
- `profiles`: SELECT público (para que la página `/[username]` funcione sin login). INSERT/UPDATE/DELETE solo si `auth.uid() = id`.
- `links`: SELECT público solo donde `is_active = true`. INSERT/UPDATE/DELETE solo si el `profile_id` pertenece al usuario autenticado.

---

## 8. Flujos de usuario

**Flujo A — Registro y primera configuración**
1. Usuario entra a `/signup` → crea cuenta con email/password
2. Se le pide elegir `username` (validado como único)
3. Se crea automáticamente su fila en `profiles`
4. Redirige a `/dashboard`

**Flujo B — Editar perfil**
1. Usuario en `/dashboard` → sección "Perfil"
2. Sube avatar, edita nombre/bio, elige colores
3. Guarda → actualiza `profiles`

**Flujo C — Gestionar links**
1. Usuario en `/dashboard` → sección "Links"
2. Formulario simple: título + URL → botón "Agregar"
3. Lista de links existentes con botones: eliminar, subir, bajar
4. Cada acción actualiza Supabase al instante (sin necesidad de "guardar" aparte)

**Flujo D — Visitante ve la página pública**
1. Entra a `tuapp.com/usuario`
2. Server-side fetch de `profiles` + `links` (solo activos, ordenados por `position`)
3. Renderiza header (avatar, nombre, bio) + lista de `LinkButton`

---

## 9. Fuera de alcance en v1 (para no gastar tokens de más — queda para v2)

- Analytics de clics por link
- Temas predefinidos / plantillas visuales
- Tipos de botón (redondeado, cuadrado, outline, con sombra)
- Drag-and-drop real (v1 usa botones ↑↓, funcionalmente equivalente)
- Iconos automáticos por plataforma (detectar que una URL es de Instagram y ponerle su ícono)
- Dominio personalizado por usuario
- Automatizaciones con n8n (ej. notificación de nuevo registro)

**Nota de extensibilidad:** los dos primeros puntos (temas y tipos de botón) están diseñados para agregarse sin refactor cuando llegue el momento, precisamente porque `LinkButton` es un componente único con props (RF-06). Agregar "tipos de botón" es una prop `variant` nueva en ese mismo componente; agregar "temas de fondo" es una columna `theme_id`/`bg_style` en `profiles` más un catálogo de estilos en código (no requiere tabla nueva en Supabase). El riesgo de refactor grande solo existiría si el proyecto hubiera terminado con componentes hardcodeados por red social — que es exactamente lo que este PRD evita desde el diseño.

---

## 10. Fases de construcción sugeridas

Para que el agente en Antigravity no intente todo en un solo prompt gigante (lo cual suele generar errores difíciles de depurar para alguien empezando):

1. **Fase 0 — Setup**: proyecto Next.js + Tailwind, conexión a Supabase, primer deploy vacío en Vercel
2. **Fase 1 — Auth y base de datos**: tablas `profiles`/`links`, RLS, registro/login funcionando
3. **Fase 2 — Dashboard de perfil**: CRUD de avatar/nombre/bio/colores
4. **Fase 3 — Dashboard de links**: CRUD + reordenar + componente `LinkButton`
5. **Fase 4 — Página pública `/[username]`**
6. **Fase 5 — Pulido responsive + QA + deploy final**

Recomendación: pide al agente en Antigravity que ejecute **una fase a la vez** y te muestre el resultado antes de seguir con la siguiente.

---

## 11. Prompt final para el agente en Antigravity (Gemini)

Copia y pega esto como mensaje inicial en Antigravity:

```
Vas a construir un clon funcional de Linktree conmigo. Soy principiante en
programación, así que explica brevemente cada decisión técnica importante
en tus respuestas, pero sin bloquear el avance.

CONTEXTO TÉCNICO DISPONIBLE:
- Tengo MCPs conectados: GitHub, Supabase, Vercel, n8n (usa Supabase MCP
  para crear tablas y políticas RLS directamente, GitHub MCP para
  commits, Vercel MCP para deploy)
- Trabajo en Antigravity de forma visual, así que evita pedirme comandos
  de terminal salvo que sea estrictamente necesario

STACK OBLIGATORIO:
- Next.js con App Router
- Tailwind CSS
- Supabase (Auth + Postgres + Storage)
- Deploy en Vercel

REGLA DE ORO DEL PROYECTO (muy importante, no te desvíes de esto):
Los links de cada usuario deben ser 100% dinámicos y configurables desde
la base de datos, NUNCA hardcodeados por red social. Debe existir UN SOLO
componente reutilizable llamado LinkButton que reciba título, url y color
como props y se use para absolutamente todos los links, sin importar la
plataforma. No quiero botones de diseño fijo por cada red social.

MODELO DE DATOS (créalo en Supabase con RLS):

Tabla profiles:
- id (uuid, FK a auth.users.id, PK)
- username (text, único)
- display_name (text)
- bio (text, nullable)
- avatar_url (text, nullable)
- bg_color (text, default '#ffffff')
- button_color (text, default '#000000')
- created_at (timestamp, default now())

Tabla links:
- id (uuid, PK)
- profile_id (uuid, FK a profiles.id)
- title (text)
- url (text)
- position (int)
- is_active (boolean, default true)
- created_at (timestamp, default now())

RLS:
- profiles: SELECT público. INSERT/UPDATE/DELETE solo si auth.uid() = id
- links: SELECT público solo donde is_active = true. INSERT/UPDATE/DELETE
  solo si el profile_id pertenece al usuario autenticado

FUNCIONALIDAD REQUERIDA:
1. Registro/login con Supabase Auth (email + password). Al registrarse,
   el usuario elige un username único y se crea su fila en profiles.
2. Dashboard privado en /dashboard (protegido, solo el dueño puede editar
   su propio contenido):
   - Editar avatar (upload a Supabase Storage), display_name, bio,
     bg_color, button_color
   - Agregar link (formulario: título + URL, valida que empiece con
     http:// o https://)
   - Eliminar link
   - Reordenar links con botones subir/bajar (actualiza el campo position)
3. Página pública dinámica en /[username] (SIN necesidad de login):
   - Muestra avatar, display_name, bio
   - El avatar es circular. Al hacer hover (desktop) hace un flip 3D tipo
     moneda con CSS puro (transform-style: preserve-3d, backface-visibility:
     hidden, rotateY), revelando un reverso decorativo con las iniciales
     del username sobre el button_color. En móvil (sin hover), el flip se
     activa con un tap. No uses ninguna librería externa para esto, es
     puro CSS/Tailwind.
   - Muestra todos los links con is_active = true, ordenados por position,
     usando el componente LinkButton
   - Usa bg_color y button_color del perfil
   - Debe verse perfecto en móvil (mobile-first, la mayoría del tráfico
     de este tipo de app es celular)

FUERA DE ALCANCE (no lo implementes en esta versión):
- Analytics de clics
- Temas predefinidos
- Drag-and-drop (usamos botones ↑↓ en su lugar)
- Iconos automáticos por plataforma
- Dominios personalizados
- Automatizaciones con n8n

PLAN DE EJECUCIÓN:
Trabajemos en fases, una a la vez. Al terminar cada fase, muéstrame qué
hiciste y espera mi confirmación antes de seguir con la siguiente:

Fase 0: Setup del proyecto Next.js + Tailwind, conexión a Supabase con
        variables de entorno, y un primer deploy vacío a Vercel para
        confirmar que el pipeline funciona.
Fase 1: Crear tablas profiles y links en Supabase (vía MCP) con las
        políticas RLS descritas arriba. Implementar registro/login.
Fase 2: Dashboard de perfil (avatar, nombre, bio, colores).
Fase 3: Dashboard de links (agregar, eliminar, reordenar) + componente
        LinkButton reutilizable.
Fase 4: Página pública /[username].
Fase 5: Ajustes responsive, QA general, y deploy final a Vercel.

Empieza por la Fase 0 y espera mi visto bueno antes de avanzar.
```

---

## 12. Notas para ti (fuera del prompt)

- Cuando el agente termine cada fase, revisa el resultado en el navegador antes de decir "sigue" — así detectas errores temprano y gastas menos cuota de Gemini corrigiendo cosas acumuladas.
- Si en la Fase 3 notas que el agente vuelve a crear botones específicos por red social (el error que detectaste en el curso), recuérdale explícitamente la "regla de oro" de la sección 11 — es el punto donde más tienden a desviarse los modelos de IA.
- Guarda este PRD en tu repo (ej. `/docs/PRD.md`) para que quede como referencia versionada junto con el código.
