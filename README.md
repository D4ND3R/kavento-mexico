# Kavento México — Landing

Landing de una sola página para **Soluciones Digitales Kavento México**.
Español por defecto, con conmutador a inglés que no recarga la página.

- **Framework:** Next.js 16 (App Router) + TypeScript estricto
- **Estilos:** Tailwind CSS v4 sobre variables CSS (design tokens)
- **Interfaz:** motor propio de Liquid Glass (filtros SVG + backdrop-filter)
- **Portada 3D:** cinta de Möbius de vidrio con dispersión y "KAVENTO" en
  letras extruidas, con un recorrido de scroll de seis tramos
  (three.js + React Three Fiber + GSAP ScrollTrigger + Lenis), ingeniería
  inversa de [altitude101.com](https://altitude101.com/)
- **Scroll:** Lenis para el desplazamiento suave; apilado de secciones
  tipo baraja, con cortinas, escrito a mano
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
rompe el apilado de secciones. La preferencia se guarda en una cookie de un año, que el servidor lee para
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
    globals.css       Design tokens, apilado, recorrido 3D y medidor
    glass.css         Motor de Liquid Glass
  components/
    sections/         Recorrido 3D (journey), nosotros, servicios, equipo,
                      contacto, pie
    three/            Escena WebGL: Möbius, letras, anillo de palabras,
                      esfera de puntos, fondo, coreografía de scroll
    mocks/            Maquetas de interfaz que ilustran cada servicio
    ui/               Logo, conmutador, botones, filtros SVG, medidor,
                      scroll suave, cursor, loader
    stack-root.tsx    Arranque del motor de apilado
  lib/
    use-scroll-stack.ts  Motor de apilado y cortinas
    lenis-store.ts    Punto de encuentro entre Lenis y quien lo consuma
    i18n/             Diccionarios y proveedor de idioma
public/
  fonts/            Space Grotesk Bold en formato typeface.json (para las
                    letras 3D; se generó con opentype.js a partir del TTF)
  hdri/             Mapa de entorno CC0 de Poly Haven (cielo despejado)
    services.ts       Lista única de servicios
    site.ts           Configuración del cliente (WhatsApp, redes, URL)
    team.ts           Datos del equipo
```

---

## Motor de Liquid Glass

El vidrio no es "fondo translúcido con blur". En `src/app/glass.css` son
cinco capas, y saltarse cualquiera lo devuelve al glassmorphism de 2020:

| Capa | Qué hace |
| --- | --- |
| Cuerpo | `backdrop-filter` con blur **y saturación**: el vidrio concentra el color de lo que hay detrás, no solo lo difumina |
| Refracción | filtro SVG `#lg-refract` (`feTurbulence` + `feDisplacementMap`) aplicado al backdrop: el canto dobla la luz |
| Especular | aro de 1px hecho con `mask-composite`, brillante en el canto que mira a la luz y con un rebote tenue en el opuesto |
| Grosor | aro interior apenas visible, para que la pieza tenga canto y no parezca una calca |
| Sombra | separa la pieza del fondo sin ensuciarlo |

Toda la luz del sitio viene de **arriba a la izquierda**: por eso cada
degradado especular usa `140deg`.

**Fusión líquida.** El filtro `#lg-goo` (`feGaussianBlur` +
`feColorMatrix` con alfa `19 -9`) hace que dos formas cercanas se unan
por un cuello en vez de solaparse. Se usa en la navbar y en el
conmutador de idioma: el indicador son **dos gotas**, una rápida y una
lenta, que al separarse quedan unidas y estiran el indicador como
líquido.

> El filtro se aplica **solo a la capa de gotas**. Un `filter` afecta a
> todo su subárbol, así que envolver también las etiquetas les borra el
> texto.

Clases disponibles: `.lg` (pieza base), `.lg--refract`, `.lg--panel`,
`.lg--solid`, `.lg--flush`, `.lg-motion`, `.lg-press`.

Todo vive en `@layer components` para que las utilidades de Tailwind
(`rounded-*`, `p-*`) sigan ganando cuando un componente necesita
salirse del valor por defecto.

---

## Apilado de secciones y cortinas

`src/lib/use-scroll-stack.ts`. Cada sección lleva `data-stack`, se fija
con `position: sticky` y una escalera de z-index creciente, de modo que
la siguiente se le monta encima como una carta sobre otra.

- `updatePins()` calcula el anclaje: si la sección es más alta que la
  pantalla se fija en `vh - alto` (negativo), para que se alcance a leer
  completa antes de quedar clavada.
- A cada sección se le inyecta una **cortina** negra cuya opacidad sube
  conforme la siguiente la cubre. Sin ella la carta de abajo se ve igual
  de brillante que la de encima y el apilado no se lee.
- Todo el trabajo por cuadro pasa por un solo `requestAnimationFrame`
  que **separa la fase de lectura de la de escritura**, para no provocar
  layout thrashing.
- La portada 3D no forma parte de la baraja: va antes, con su propio
  motor, y la primera carta (nosotros) la tapa al subir.

> Si el scroll se rompe o las secciones dejan de empalmarse, revisa que
> ningún ancestro tenga `overflow: hidden`. En `body` se usa
> `overflow-x: clip` justamente por eso: `hidden` convierte al body en
> contenedor de scroll y anula todos los `sticky`.

---

## Recorrido 3D (portada)

Ingeniería inversa de la portada de altitude101.com (Metabole Studio),
adaptada a la paleta de Kavento. Vive en `src/components/three/` y en
`src/components/sections/journey.tsx`.

**Qué hay en la escena** (`scene.tsx`):

- `mobius.tsx` — la cinta de Möbius. No se carga ningún modelo: la
  geometría se genera por código (`mobius-geometry.ts`) barriendo un
  rectángulo redondeado a lo largo de un círculo con media vuelta. El
  material es el del original (`MeshPhysicalMaterial` con
  `dispersion: 5`, `ior: 1.2`, `roughness: 0.1`, mapa de entorno HDRI),
  con dos desviaciones documentadas en el archivo: transmisión 1 en vez
  de 1.5 (sobre fondo oscuro 1.5 se quema a blanco) y algo de
  iridiscencia para que tenga color aunque no haya nada brillante detrás.
- `hero-letters.tsx` — "KAVENTO" en siete letras extruidas
  (`Text3D`, Space Grotesk Bold), con kerning manual y un shader de
  degradado en espacio de mundo (`gradient-material.tsx`:
  naranja → dorado → teal). El grupo se escala para ocupar el 84 % del
  ancho visible a su profundidad, así la palabra es enorme en cualquier
  pantalla.
- `word-ring.tsx` — tres palabras (DISEÑO / CÓDIGO / ESCALA) en tres
  lados de un cuadrado alrededor de la cámara; el scroll lo gira de
  cuarto en cuarto.
- `dots-sphere.tsx` — esfera de puntos que envuelve la cámara.
- `backdrop.tsx` — plano lejano con las tres masas de luz de la paleta,
  para que el vidrio tenga algo que refractar.

**Cómo se mueve** (`use-journey.ts`, `smooth-transform.ts`,
`constants.ts`):

- Seis bloques vacíos (`#section-1` … `#section-8`) dan recorrido a la
  escena fija. Seis disparadores de GSAP ScrollTrigger, uno por tramo,
  dejan *objetivos* (posición, rotación, giro) en un almacén compartido
  (`scene-store.ts`); el bucle de render los persigue con inercia
  (`SmoothTransform`, puerto del sistema del original). Nada pasa por
  estado de React.
- Tramos: portada (el modelo se va a la derecha y las letras suben
  escalonadas) → manifiesto (vuelta completa sobre X, cuatro líneas de
  texto) → tramo fijado con imán en cada palabra (vuelve al centro,
  retrocede, anillo de palabras) → dos vuelcos → cierre (la cámara cae,
  el modelo se apaga). Los anclajes y tiempos están en `PINS`, `LERP`,
  `HERO_LETTERS` y `DRAG` de `constants.ts`.
- Ratón: inclina modelo, letras y puntos con distinta amplitud. En la
  portada se puede arrastrar el modelo (con inercia; el giro automático
  vuelve a los 800 ms).
- El medidor de la derecha (`scroll-gauge.tsx`) son 101 rayas y la
  cifra 000 % → 101 %, leídas del progreso de Lenis.

**Lenis + GSAP** (`smooth-scroll.tsx`): Lenis con la configuración del
original (1.2 s, curva exponencial), su reloj lo lleva `gsap.ticker` y
cada evento de scroll llama a `ScrollTrigger.update`. El motor de
apilado no necesita saber que existe: Lenis mueve la ventana de verdad.

**Loader**: espera a `load` y al evento `kavento:scene-ready` (letras
maquetadas); si el WebGL no responde, sigue a los 7 s.

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
| `--accent-teal-hi` | `#5FC8D8` | Teal para texto pequeño sobre vidrio |
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
  esenciales, el apilado deja las cortinas en su estado final y el
  scroller horizontal muestra los paneles en columna, que es el estado
  legible.
- Las maquetas de servicio son decorativas y están marcadas como tales;
  ninguna información existe solo dentro de una animación.

## Rendimiento

Dependencias de terceros: three.js, React Three Fiber, drei, GSAP
(ScrollTrigger) y Lenis. El lienzo WebGL se carga aparte y solo en
cliente (`next/dynamic` con `ssr: false`); el resto de la página no
espera por él.

La escena es lo caro: el vidrio con transmisión renderiza la escena dos
veces por cuadro, así que el `dpr` va acotado a 1.5 en escritorio y
1.25 en móvil, y la esfera de puntos lleva menos divisiones que la
original. Con `prefers-reduced-motion` el modelo no gira solo y no hay
inclinación con el ratón; el recorrido sigue al scroll.

Reglas que se siguen para que el scroll vaya a 60 fps:

- Un solo `requestAnimationFrame` para toda la página, con las lecturas
  (`getBoundingClientRect`) separadas de las escrituras (`style`).
- Nunca `filter: blur()` sobre contenedores del tamaño de la pantalla:
  colapsa la GPU. Las cortinas son divs con opacidad plana y el
  difuminado del campo de fondo va en los topes del degradado.
- Solo se anima `transform` y `opacity`. El campo de fondo deriva con
  `translate3d`, nunca cambiando posición ni tamaño.
- Las maquetas de servicio son DOM y CSS, no canvas.

## Sobre el stack propuesto

Desviaciones respecto del brief original, todas deliberadas:

- **El 3D vuelve, pero solo en la portada.** El primer montaje usaba
  react-three-fiber para el sol del hero y cinco escenas abstractas de
  servicio, y se retiró. Ahora hay una sola escena, la del recorrido de
  la portada (Möbius + letras), calcada de altitude101. Los servicios
  siguen ilustrados con maquetas DOM de la interfaz que Kavento
  construye, no con 3D.
- **GSAP se usa solo para la coreografía 3D.** El apilado, las cortinas
  y el carrusel de trabajos siguen escritos a mano contra la API nativa
  del DOM. Framer Motion no se instaló: las transiciones de la interfaz
  son CSS.
- **La internacionalización no usa `next-intl`.** Su enfoque enruta por
  idioma (`/es`, `/en`), y navegar entre rutas pierde la posición de
  scroll y rompe el apilado de secciones. El brief pedía que el
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
