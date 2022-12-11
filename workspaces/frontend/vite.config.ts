import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
    define: {
        // TODO: Remove duplication with backend/src/settings
        BACKEND_PORT: +(process.env.BACKEND_PORT ?? 10555),
    },
    plugins: [solidPlugin()],
    build: {
        target: "esnext",
    },
});
