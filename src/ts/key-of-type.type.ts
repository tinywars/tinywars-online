/**
 * Extracts the union of keys from an object
 * with the given value type
 *
 * @example
 * type X = { a: string, b: number }
 * type T1 = keyof x //--> "a" | "b"
 * type T2 = KeyOfType<x, string> //--> "a"
 */
export type KeyOfType<T, K> = {
    [I in keyof T]: T[I] extends K ? I : never;
}[keyof T];
