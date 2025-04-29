/**
 * Judges if the value is not null or undefined.
 *
 * @public
 */
export const isDefined = <T>(value: T): value is NonNullable<T> => value != null
