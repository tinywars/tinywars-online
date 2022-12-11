import { resolve } from "path";

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const HOST_IP = process.env.HOST_IP ?? "localhost";
export const BACKEND_PORT = +(process.env.BACKEND_PORT ?? 10555);
export const STATIC_FILES_PATH = resolve(
    process.env.STATIC_FILES_PATH ?? __dirname + "../../../frontend/dist",
);
