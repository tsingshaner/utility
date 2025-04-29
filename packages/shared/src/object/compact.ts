import { isDefined } from '../type-guard'

/**
 * Compact an object by removing all properties that are null or undefined.
 * @param o - The source object.
 * @param filterFn - A function that determines whether to include a property in the result.
 *
 * @public
 */
export const compact = <T extends object>(o: T, filterFn: (v: unknown, k: keyof T) => boolean = isDefined): T => {
  const result = {} as T
  for (const key in o) {
    if (filterFn(o[key], key)) {
      result[key] = o[key]
    }
  }

  return result
}
