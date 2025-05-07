/**
 * Executes a download of a blob or media source.
 * @param blob - Blob or MediaSource to be downloaded.
 * @param filename - The name of the file to be downloaded.
 * @remarks
 * This function creates a temporary anchor element, sets its href to the blob URL,
 * and programmatically clicks it to trigger the download.
 *
 * @public
 */
export const execDownload = (blob?: Blob | File | MediaSource, filename?: string): void => {
  if (!blob) {
    return
  }

  const url = window.URL.createObjectURL(blob)
  const downloadLink = document.createElement('a')

  downloadLink.ariaHidden = 'true'
  downloadLink.download = filename ?? 'download'
  downloadLink.href = url
  downloadLink.rel = 'noopener' // @cspell:ignore noopener
  downloadLink.style.display = 'none'
  downloadLink.tabIndex = -1

  document.body.appendChild(downloadLink)

  downloadLink.click()
  downloadLink.remove()
  requestAnimationFrame(() => URL.revokeObjectURL(url))
}
