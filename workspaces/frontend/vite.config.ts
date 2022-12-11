import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
    define: {
        BACKEND_URL: (process.env.BACKEND_URL ?? 'http://localhost:10555'),
    },
    plugins: [solidPlugin()],
    build: {
        target: "esnext",
    },
});
