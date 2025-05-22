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

// bench('escape function benchmark', () => {
//   escapeHTML('<script>alert("xss")</script>')
// })

// bench('escape function benchmark multi replace', () => {
//   escapeHTMLSlow('<script>alert("xss")</script>')
// })

bench('use apply', () => {
  const a = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
  const b = ['k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't']

  a.push.apply(a, b)
})

bench('directly use apply', () => {
  const a = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
  const b = ['k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't']

  a.push(...b)
})
