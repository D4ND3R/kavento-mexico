# Kavento México — Landing

Landing de una sola página para **Soluciones Digitales Kavento México**.
Español por defecto, con conmutador a inglés que no recarga la página.

- **Framework:** Next.js 16 (App Router) + TypeScript estricto
- **Estilos:** Tailwind CSS v4 sobre variables CSS (design tokens)
- **3D:** react-three-fiber + drei, montado de forma perezosa por sección
- **Animación de scroll:** GSAP + ScrollTrigger
- **Contacto:** enlace profundo a WhatsApp, sin backend

---

## Correr en local

Requisitos: Node.js 20 o superior.

```bash
npm install
cp .env.example .env.local   # y llena los valores
npm run dev
```

Abre <http://localhost:3000>.

Otros comandos:

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |

---

## Cambiar el número de WhatsApp

Edita `.env.local`:

```bash
NEXT_PUBLIC_WHATSAPP_NUMBER=5215512345678
```

Formato internacional, **solo dígitos**: sin `+`, sin espacios, sin guiones.
Para México son `52` (país) + `1` (móvil) + los 10 dígitos del número.

El número alimenta a la vez el botón flotante, el botón del hero y el
formulario de contacto. Si se deja vacío, la interfaz lo avisa en pantalla
en lugar de abrir un enlace roto.

Después de cambiarlo, reinicia el servidor de desarrollo: las variables
`NEXT_PUBLIC_*` se incrustan en el bundle durante el build.

---

## Editar los textos (español e inglés)

**Ningún texto vive dentro de los componentes.** Todo está en dos
diccionarios JSON con la misma forma:

```
src/lib/i18n/messages/es.json   ← español (fuente de verdad)
src/lib/i18n/messages/en.json   ← inglés
```

Para cambiar una frase, búscala por su ruta y edítala en **ambos** archivos.
Ejemplo — el titular del hero:

```jsonc
// es.json
"hero": { "titleLine1": "Cualquier cosa digital." }
// en.json
"hero": { "titleLine1": "Anything digital." }
```

`es.json` define las claves válidas. Si agregas una clave nueva ahí,
TypeScript te obligará a agregarla también en `en.json`, y usar una clave
que no existe es un error de compilación, no un hueco vacío en producción.

### Cómo funciona el conmutador de idioma

El idioma es estado de React (`src/lib/i18n/provider.tsx`), no una ruta.
Cambiarlo no navega, así que **no se pierde la posición de scroll** ni se
desmontan los canvas 3D. La preferencia se guarda en una cookie de un año, que el servidor lee para
servir el HTML con el atributo `lang` correcto desde el primer byte: sin
parpadeo de idioma al recargar.

---

## Cambiar las fotos y los datos del equipo

1. Coloca los retratos en `public/equipo/` (recomendado: 800×1000 px, WebP o AVIF).
2. Edita `src/lib/team.ts`:

```ts
export const team: TeamMember[] = [
  { id: "m1", name: "Ana Ruiz", role: "Dirección técnica", photo: "/equipo/ana.webp" },
];
```

Deja `name`, `role` o `photo` en `null` para mostrar el marcador.
Agrega o quita elementos del arreglo libremente: la cuadrícula se adapta.

Las fotos de la sección *"¿A qué nos dedicamos?"* se reemplazan en
`public/nosotros/` y se referencian desde `src/components/sections/about.tsx`.

---

## Marcadores pendientes de reemplazar

| Qué | Dónde |
| --- | --- |
| Número de WhatsApp | `.env.local` |
| Nombres, puestos y retratos del equipo | `src/lib/team.ts` + `public/equipo/` |
| Fotos de oficina y equipo trabajando | `public/nosotros/` |
| Perfiles de redes sociales | `src/lib/site.ts` → `socialLinks` |
| Aviso de privacidad | `src/components/sections/footer.tsx` |
| Logo original en mapa de bits | `public/logo-kavento.svg` (hoy es una reconstrucción vectorial) |
| ID de analytics | `.env.local` |

---

## Estructura

```
src/
  app/
    layout.tsx        Tipografías, metaetiquetas, idioma inicial
    page.tsx          Composición de la página única
    globals.css       Design tokens y utilidades base
  components/
    sections/         Hero, nosotros, servicios, equipo, contacto, pie
    three/            Escenas 3D por servicio
    ui/               Logo, conmutador de idioma, botones
  lib/
    i18n/             Diccionarios y proveedor de idioma
    site.ts           Configuración del cliente (WhatsApp, redes, URL)
    team.ts           Datos del equipo
```

---

## Design tokens

Todos los colores, radios, tiempos y curvas viven en `:root` dentro de
`src/app/globals.css`. **Los componentes no llevan hex crudo.** Cambiar la
paleta completa es editar ese bloque.

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg-primary` | `#120E0A` | Fondo general (negro café) |
| `--bg-surface` | `#1D1712` | Tarjetas y secciones alternas |
| `--accent-from` → `--accent-to` | `#FF7A1A` → `#FFC94A` | Degradado solar del logo |
| `--accent-teal` | `#2FA8B8` | Acento secundario, estados hover |
| `--text-primary` | `#F5EFE6` | Texto principal |
| `--text-muted` | `#B5A995` | Texto secundario |
| `--text-faint` | `#9C9382` | Notas y textos terciarios |
| `--border-subtle` | `rgba(255,255,255,.08)` | Separadores y vidrio |

El naranja `#FF7A1A` **no se usa para texto pequeño** (2.9:1 sobre el fondo):
solo para rellenos, bordes y luz. Sobre el fondo general, `#B5A995` da
7.4:1 y `#9C9382` da 6.3:1; el más exigente es `#9C9382` sobre
`--bg-elevated`, que da 5.3:1. Todo el texto pasa AA.

---

## Accesibilidad

- Contraste AA en todo el texto (auditado sobre el build de producción:
  cero fallas).
- Objetivos táctiles de 24px o más en los 35 elementos enfocables,
  según WCAG 2.2.
- Navegación completa por teclado. El primer tabulable es el enlace
  "Saltar al contenido" y el anillo de foco usa el ámbar de la marca.
- Estructura de encabezados sin saltos (H1 → H2 → H3) y landmarks
  `main`, `footer` y `nav` etiquetados.
- `prefers-reduced-motion` respetado: se apagan las animaciones no
  esenciales, no se carga GSAP y los modelos 3D se pintan una sola vez
  en su estado ensamblado en lugar de animarse.
- Los canvas de servicio son decorativos y están marcados como tales;
  ninguna información existe solo dentro de una animación.

## Rendimiento

three.js, react-three-fiber, drei y GSAP suman más de un megabyte sin
comprimir. Están detrás de fronteras de carga (`src/components/three/lazy.tsx`
y un `import()` dinámico dentro de `useScrollProgress`), así que **no entran
en el bundle inicial**: la primera carga sirve 608 KB de JavaScript sin
comprimir en lugar de 1601 KB.

Además:

- Los canvas se montan cuando su sección se acerca al viewport y detienen
  el bucle de render al salir de pantalla, sin perder el contexto WebGL.
- El pixel ratio se limita a 2 (1.5 en pantallas táctiles).
- La corona del sol es un único `InstancedMesh`: 200 piezas en una sola
  llamada de dibujo.

## Sobre el stack propuesto

Dos desviaciones respecto del brief, ambas deliberadas:

- **Framer Motion no se instaló.** El único momento de carga orquestado
  se resuelve con animaciones CSS, que pesan cero y respetan
  `prefers-reduced-motion` sin código extra. Agregar Framer Motion
  sumaría peso sin habilitar nada que no esté ya cubierto.
- **La internacionalización no usa `next-intl`.** Su enfoque enruta por
  idioma (`/es`, `/en`), y navegar entre rutas pierde la posición de
  scroll y desmonta los canvas 3D. El brief pedía explícitamente que el
  conmutador no recargue ni pierda el scroll, así que se usa la
  alternativa que el propio brief autoriza: diccionarios JSON con un
  proveedor de cliente.

---

## Despliegue

El proyecto es un sitio estático de Next.js sin backend. En Vercel:

1. Importa el repositorio.
2. Declara las variables de `.env.example` en el panel del proyecto.
3. Deploy.

Cualquier hosting con soporte para Next.js 16 funciona igual.

---

## Flujo de trabajo

- `main` protegida, se integra solo vía Pull Request.
- Ramas de trabajo: `feat/<nombre>`, `fix/<nombre>`, `chore/<nombre>`.
- Commits en [Conventional Commits](https://www.conventionalcommits.org/), en español.
- CI (`.github/workflows/ci.yml`) corre lint, verificación de tipos y build
  en cada PR.
