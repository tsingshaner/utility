/**
 * Format bytes to readable string.
 * @param bytes - The size of bytes to format.
 * @param decimals - Format decimals, default is 2.
 * @see {@link https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript/18650828#18650828 | source}
 *
 * @public
 */
export const formatBytes = (bytes: number, decimals?: number): string => {
  if (bytes === 0) {
    return '0 Bytes'
  }

  const k = 1024
  const localDecimals = decimals ?? 2
  const dm = localDecimals < 0 ? 0 : localDecimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}
