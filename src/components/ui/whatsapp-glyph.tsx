/**
 * Glifo de "escríbenos": una burbuja de conversación con un auricular
 * dentro.
 *
 * A propósito NO se reproduce el logotipo de WhatsApp: es marca
 * registrada de Meta y usarlo requiere permiso de marca. Este dibujo
 * comunica lo mismo y va en los colores de Kavento. Si el cliente
 * obtiene autorización de marca, basta con sustituir este componente
 * por el asset oficial.
 */
export function WhatsappGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      {/* Burbuja con cola inferior izquierda */}
      <path
        d="M12 2.9a9.1 9.1 0 0 0-7.8 13.8L2.9 21.1l4.5-1.2A9.1 9.1 0 1 0 12 2.9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Auricular: un arco con los extremos engrosados */}
      <path
        d="M9.1 8.6c0 3.5 2.8 6.3 6.3 6.3"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
