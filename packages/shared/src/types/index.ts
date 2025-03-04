/**
 * A async function that can take any arguments and return a PromiseLike value.
 *
 * @public
 */
// biome-ignore lint/suspicious/noExplicitAny: use any for generic types
export type AnyAsyncFunc = (...args: any[]) => PromiseLike<any>
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
