import { describe, expect } from 'vitest'

import { escapeHTML, escapeMD } from './escape'

describe('Should escape.', (test) => {
  test.each([
    [`"/&<>'`, '&quot;&#x2F;&amp;&lt;&gt;&#39;'],
    ['<script>alert("hi")</script>', '&lt;script&gt;alert(&quot;hi&quot;)&lt;&#x2F;script&gt;'],
    ['foo', 'foo'],
    ['a && b', 'a &amp;&amp; b'],
    ['"foo"', '&quot;foo&quot;'],
    ["'bar'", '&#39;bar&#39;'],
    ['<div>', '&lt;div&gt;']
  ])('Should escape HTML text `%s` -> `%s`', (input, expected) => expect(escapeHTML(input)).toBe(expected))

  test.each([
    ['foo', 'foo'],
    ['a && b', 'a && b'],
    ['"foo"', '"foo"'],
    ["'bar'", "'bar'"],
    ['<div>', '<div>'],
    [String.raw`\  *_{}[]()#+-.!|`, String.raw`\\  \*\_\{\}\[\]\(\)\#\+\-\.\!\|`],
    ['"a" | "b"', '"a" \\| "b"'],
    ['*bold*', '\\*bold\\*']
  ])('Should unescape markdown text `%s` -> `%s`', (input, expected) => expect(escapeMD(input)).toBe(expected))

  test.each([
    [`"/&<>'`, '&quot;&#x2F;&amp;&lt;&gt;&#39;'],
    ['<script>alert("hi")</script>', String.raw`&lt;script&gt;alert\(&quot;hi&quot;\)&lt;&#x2F;script&gt;`],
    ['foo', 'foo'],
    ['a && b', 'a &amp;&amp; b'],
    ['"foo"', '&quot;foo&quot;'],
    ["'bar'", '&#39;bar&#39;'],
    ['<div>', '&lt;div&gt;'],
    [String.raw`\  *_{}[]()#+-.!|`, String.raw`\\  \*\_\{\}\[\]\(\)\#\+\-\.\!\|`],
    ['"a" | "b"', String.raw`&quot;a&quot; \| &quot;b&quot;`],
    ['*bold*', String.raw`\*bold\*`]
  ])('Should escape markdown & html text `%s` -> `%s`', (input, expected) =>
    expect(escapeHTML(escapeMD(input))).toBe(expected)
  )
})
