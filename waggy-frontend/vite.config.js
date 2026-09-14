/**
 * Optional Vite config. The default `npm start` uses scripts/serve.mjs
 * so a copied workspace does not require installing Vite.
 *
 * If you use Vite: copy .env.example to .env and set VITE_WAGGY_API_BASE_URL.
 */
export default {
  envPrefix: ["VITE_"],
  server: { port: 5173 },
  build: { outDir: "dist", emptyOutDir: true },
};
