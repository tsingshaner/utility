/**
 * A utility function to clamp a value between a minimum and maximum value.
 * @param value - The value to be clamped.
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns The clamped value.
 *
 * @public
 */
export const clamp = <T = number>(value: T, min: T, max: T): T => {
  if (value < min) {
    return min
  }

  return value > max ? max : value
}
