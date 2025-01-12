import { describe, expect } from 'vitest'

import { escapeHTML, escapeMD } from './escape'

describe('Should escape.', (test) => {
  test.each([
    ['<script>alert("hi")</script>', '&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt;'],
    ['foo', 'foo'],
    ['a && b', 'a &amp;&amp; b'],
    ['"foo"', '&quot;foo&quot;'],
    ["'bar'", '&#39;bar&#39;'],
    ['<div>', '&lt;div&gt;']
  ])('Should escape HTML text.', (input, expected) => expect(escapeHTML(input)).toBe(expected))

  test('Should escape markdown text.', ({ expect }) => {
    const output = escapeMD('*bold*')
    expect(output).toBe('\\*bold\\*')
  })
})
