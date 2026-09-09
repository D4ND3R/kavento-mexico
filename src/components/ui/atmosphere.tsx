/**
 * Campo de fondo. Es lo único que hay detrás de todo el vidrio, y
 * existe para que el vidrio tenga algo que refractar: masas de luz
 * cálida a la deriva, láminas diagonales y grano.
 *
 * Va fijo y en `z-index: 0`; las secciones apiladas viven encima con
 * su propio fondo opaco, así que el campo se ve completo en el hero y
 * asoma por los bordes del vidrio en el resto de la página.
 *
 * Es CSS puro: sin canvas, sin WebGL y sin un solo kilobyte de
 * JavaScript. La cortina que lo abre la mueve `--curtain`, que escribe
 * el motor de apilado.
 */
export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere__glow" />
      <div className="atmosphere__slats" />
      <div className="atmosphere__grain" />
    </div>
  );
}
