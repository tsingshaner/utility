const htmlEscapeRE = /[<>&"']/g

/**
 * @param text - The content to process.
 *
 * @beta
 */
export const escapeHTML = (text: string): string =>
  text.replace(htmlEscapeRE, (c) => {
    switch (c) {
      case "'":
        return '&#39;'
      case '"':
        return '&quot;'
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      default:
        return c
    }
  })

/**
 * @param text - The content to process.
 *
 * @beta
 */
export const unescapeHTML = (text: string): string => {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
}

const mdEscapeRE = /([|*_~`])/g

/**
 * @param text - The content to process.
 *
 * @beta
 */
export const escapeMD = (text: string): string => text.replace(mdEscapeRE, '\\$1')

/**
 * @param text - The content to process.
 *
 * @beta
 */
export const unescapeMD = (text: string): string => text.replace(/\\([|*_~`])/g, '$1')
