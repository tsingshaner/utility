import { bench } from 'vitest'

import { escapeHTML } from './escape'

export const escapeHTMLSlow = (text: string): string =>
  text
    .replaceAll("'", '&#39;')
    .replaceAll('"', '&quot;')
    .replaceAll('/', '&#x2F;')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

bench('escape function benchmark', () => {
  escapeHTML('<script>alert("xss")</script>')
})

bench('escape function benchmark multi replace', () => {
  escapeHTMLSlow('<script>alert("xss")</script>')
})
