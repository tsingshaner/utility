const htmlEscapeRE = /[<>&"']/g

export const escapeHTML = (text: string) =>
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

export const unescapeHTML = (text: string) => {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
}

const mdEscapeRE = /([|*_~`])/g

export const escapeMD = (text: string) => text.replace(mdEscapeRE, '\\$1')
export const unescapeMD = (text: string) => text.replace(/\\([|*_~`])/g, '$1')
