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
