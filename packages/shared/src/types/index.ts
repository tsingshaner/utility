/**
 * A async function that can take any arguments and return a PromiseLike value.
 *
 * @public
 */
// biome-ignore lint/suspicious/noExplicitAny: use any for generic types
export type AnyAsyncFunc = (...args: any[]) => PromiseLike<any>

/**
 * Get return type of async func.
 *
 * @public
 */
export type AwaitedReturnType<T extends AnyAsyncFunc> = Awaited<ReturnType<T>>

/**
 * A function that can take any arguments and return any value.
 *
 * @public
 */
// biome-ignore lint/suspicious/noExplicitAny: use any for generic types
export type AnyFunc = (...args: any[]) => any

/**
 * A type that can be either a Promise or a direct value.
 *
 * @public
 */
export type MaybePromise<T> = PromiseLike<T> | T

/**
 * Generic an array type which behaves like a set.
 *
 * @public
 */
// biome-ignore lint/suspicious/noExplicitAny: use any for generic types
export type ArraySet<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends R[number]
    ? never
    : [F, ...ArraySet<R>]
  : T

/**
 * A type representing the return type of the setTimeout function.
 *
 * @public
 */
export type Timeout = ReturnType<typeof setTimeout>

/**
 * A type representing the return type of the setInterval function.
 *
 * @public
 */
export type FuncWithProps<T extends AnyFunc, P extends object> = P & T

/**
 * A type helper.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }

/**
 * Used to create a mutually exclusive relationship between two object types.
 *
 * @remarks
 * It ensures that among two object types, there can only be one object type attribute set,
 * and not both attribute sets.
 *
 * @see {@link https://github.com/maninak/ts-xor/blob/master/README.md | ts-xor}
 *
 * @example
 * ```ts
 * type Color = Xor<Rgb, Hex>
 * type Hex = Record<'hex', `#${string}` | number>
 * type Rgb = Record<'r' | 'g' | 'b', number>
 *
 * const color: Color = { hex: '#000000' } // ok
 * const color: Color = { r: 0, g: 0, b: 0 } // ok
 * const color: Color = { hex: '#000000', r: 0 } // type error
 *
 * const color: Rgb | Hex = { hex: '#000000', r: 0 } // ok
 * ```
 *
 * @public
 */
export type Xor<T, U> = T | U extends object ? (T & Without<U, T>) | (U & Without<T, U>) : T | U
