/**
 * Filtros SVG del motor de vidrio. Se montan una sola vez, en un SVG de
 * 0×0, y se referencian desde CSS con `filter: url(#id)` o
 * `backdrop-filter: url(#id)`.
 *
 * `color-interpolation-filters="sRGB"` es obligatorio: sin él los
 * filtros operan en linearRGB y los bordes salen lavados y con halo.
 */
export function GlassFilters() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      colorInterpolationFilters="sRGB"
    >
      <defs>
        {/*
          REFRACCIÓN
          Ruido suave que desplaza el backdrop. `scale` controla cuánto
          se dobla la luz: por encima de ~24 deja de leerse como vidrio
          y empieza a leerse como agua sucia.
        */}
        <filter id="lg-refract" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0055 0.011"
            numOctaves={2}
            seed={11}
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="4" result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale="16"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/*
          FUSIÓN LÍQUIDA
          Desenfoca, sube brutalmente el contraste del canal alfa y
          vuelve a componer el original encima. Dos formas cercanas
          quedan unidas por un cuello, como una gota partiéndose.
          La matriz 19/-9 es la que usa tech-ish.org y es la que mejor
          equilibra cuello grueso sin comerse las esquinas.
        */}
        <filter id="lg-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 19 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>

        {/*
          GRANO
          Se aplica al campo de fondo, no a la interfaz: rompe el
          bandeado de los degradados grandes, que en pantallas de 8 bits
          se ve a franjas.
        */}
        <filter id="lg-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves={3}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
    </svg>
  );
}
