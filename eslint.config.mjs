import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Ignores por defecto de eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Herramientas de terceros vendorizadas por GSD Core: no son
    // código del proyecto y no deben romper el CI.
    ".claude/**",
  ]),
  {
    // La capa 3D es imperativa por diseño: GSAP y three.js escriben
    // posiciones, rotaciones y uniformes en objetos que viven fuera del
    // render de React (el almacén de la escena, la cámara, las mallas).
    // La regla de inmutabilidad del compilador de React marca cada una
    // de esas escrituras; aquí no son un error sino el mecanismo.
    files: ["src/components/three/**", "src/components/sections/journey.tsx"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
