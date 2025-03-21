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
// 定义排除类型：将U从T中剔除, keyof 会取出T与U的所有键, 限定P的取值范围为T中的所有键, 并将其类型设为never
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
// 定义互斥类型，T或U只有一个能出现（互相剔除时，被剔除方必须存在）
export type Xor<T, U> = (T & Without<U, T>) | (U & Without<T, U>)

// eslint-disable-next-line perfectionist/sort-modules, perfectionist/sort-intersection-types
export type RequireAtLeastOneTrue<T, Keys extends keyof T> = Omit<T, Keys> & {
  [K in Keys]: T[K] extends boolean ? true : T[K]
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
} & {
  [K in Keys]?: false
} extends infer O
  ? { [P in keyof O]: O[P] }
  : never
