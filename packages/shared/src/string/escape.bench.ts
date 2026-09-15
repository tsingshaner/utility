import { test } from 'vitest'

import { escapeHTML } from './escape'

export const escapeHTMLSlow = (text: string): string =>
  text
    .replaceAll("'", '&#39;')
    .replaceAll('"', '&quot;')
    .replaceAll('/', '&#x2F;')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

test('escape function benchmark', async ({ bench }) => {
  await bench.compare(
    bench('escapeHTML', () => escapeHTML('<script>alert("xss")</script>')),
    bench('multi replace', () => escapeHTMLSlow('<script>alert("xss")</script>'))
  )
})
