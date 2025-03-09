import type { ArraySet } from '../types'

/**
 * Create a shallow copy of the object with the specified keys omitted.
 * @param obj - The source object.
 * @param keys - The keys to omit from the source object.
 * @returns A new object with the specified keys omitted.
 * @remarks
 * This function creates a shallow copy of the source object and omits the specified keys from the copy.
 *
 * @public
 */
export const toOmitted = <T extends object, K extends (keyof T)[]>(obj: T, keys: ArraySet<K>): Omit<T, K[number]> =>
  omit({ ...obj }, keys)

/**
 * Omit specified keys from an object in place.
 * @param obj - The source object.
 * @param keys - The keys to omit from the source object.
 * @returns The original object with the specified keys omitted.
 *
 * @remarks This function modifies the source object in place, omitting the specified keys.
 *
 * @public
 */
export const omit = <T extends object, K extends (keyof T)[]>(obj: T, keys: ArraySet<K>): Omit<T, K[number]> => {
  for (const key of keys) {
    Reflect.deleteProperty(obj, key)
  }
  return obj
}
