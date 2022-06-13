/**
 * Flattens the type representation for
 * more complex types
 *
 * @example
 * type X = { a: number } & { b: string }
 * type Y = Identity<X> //--> { a: number, b: string}
 */
export type Identity<T> = T extends object
    ? {
          [P in keyof T]: Identity<T[P]>;
      }
    : T;
