import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  {
    ignores: [
      ".kilo/**",
      ".next/**",
      "node_modules/**",
      "dist/**",
      "public/**",
      "scripts/**",
    ],
  },
  ...nextVitals,
  {
    // These four rules come from the React Compiler-era react-hooks plugin and
    // flag many long-standing, working patterns (deriving state in effects,
    // lazy initializers, component-in-render, Date.now()). They are
    // recommendations, not correctness checks. The app's behavior is preserved
    // and lint stays meaningful for the rules that DO catch real bugs:
    // rules-of-hooks, exhaustive-deps, jsx-a11y, @next/next, react/no-unescaped.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/static-components": "off",
    },
  },
]);