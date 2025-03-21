/**
 * Options for the mergeObject function.
 *
 * @public
 */
export interface MergeObjectOptions {
  /**
   * If set to true, empty values (undefined, null) will be accepted and override obj1 value.
   *
   * @defaultValue false
   */
  acceptEmptyValues?: boolean
  /**
   * The strategy to merge arrays.
   *
   * @remarks
   * - `concat`: Concatenate the arrays.
   * - `union`: Creates a union of the arrays (unique values).
   * - `replace`: Replace the arrays.
   *
   * @defaultValue 'concat'
   */
  arrayMergeStrategy?: 'concat' | 'replace' | 'union' | ((arr1: unknown[], arr2: unknown[]) => unknown[])
}

const mergeArray = <T>(arr1: T[], arr2: T[], strategy: MergeObjectOptions['arrayMergeStrategy'] = 'concat'): T[] => {
  switch (strategy) {
    case 'replace':
      return arr2
    case 'union':
      return Array.from(new Set([...arr1, ...arr2]))
    default:
      return typeof strategy === 'function' ? (strategy(arr1, arr2) as T[]) : arr1.concat(arr2)
  }
}

/**
 * Recursively merges two objects together, modifying the first object.
 *
 * @remarks
 * This function will merge the second object into the first object.
 * It will not create a new object but modify the first object.
 *
 * @param source - The object to merge into.
 * @param overrides - The object to merge from.
 * @param opts - The options for merging. See {@link MergeObjectOptions}.
 * @returns The merged object.
 *
 * @public
 */
export const mergeObject = <T extends object, U extends object>(
  source: T,
  overrides: U,
  opts?: MergeObjectOptions
): T & U => {
  for (const key of Reflect.ownKeys(overrides)) {
    const override = Reflect.get(overrides, key)

    if (override == null) {
      if (opts?.acceptEmptyValues) {
        Reflect.set(source, key, override)
      }

      continue
    }

    const sourceValue = Reflect.get(source, key)

    if (typeof sourceValue !== 'object' || typeof override !== 'object') {
      Reflect.set(source, key, override)
      continue
    }

    if (Array.isArray(sourceValue) && Array.isArray(override)) {
      Reflect.set(source, key, mergeArray(sourceValue, override, opts?.arrayMergeStrategy))
      continue
    }

    Reflect.set(source, key, mergeObject(sourceValue as object, override, opts))
  }

  return source as T & U
}
