import type { Arrayable } from 'type-fest'

// biome-ignore lint/suspicious/noExplicitAny: for generic types
export type ToArray<T> = T extends any[] ? T : T[]

/**
 * Ensure value is an array.
 * @param v - value to process.
 * @returns
 * Return value as an array.
 * If value is null or undefined return an empty array.
 *
 * @public
 */
export const toArray = <T>(v: Arrayable<T>): ToArray<T> => (Array.isArray(v) ? v : v == null ? [] : [v]) as ToArray<T>
