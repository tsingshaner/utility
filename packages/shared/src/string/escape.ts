const htmlEscapeRE = /["\/&<>']/g

/**
 * Escape HTML content.
 * @param text - The content to encode.
 *
 * @remarks
 * Will convert special characters to their HTML entities.
 * - `'` --> `&#39;`
 * - `&` --> `&amp;`
 * - `<` --> `&lt;`
 * - `>` --> `&gt;`
 * - `"` --> `&quot;`
 * - `/` --> `&#x2F;`
 * @see {@link https://javadoc.io/static/org.owasp.encoder/encoder/1.3.1/org/owasp/encoder/Encode.html#forHtml(java.lang.String) | Encode Table}
 *
 * @public
 */
export const escapeHTML = (text: string): string =>
  text.replace(htmlEscapeRE, (c) => {
    switch (c as '"' | '/' | '&' | '<' | '>' | "'") {
      case "'":
        return '&#39;'
      case '"':
        return '&quot;'
      case '/':
        return '&#x2F;'
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
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

const mdEscapeRE = /([\[\]|*_~`\\{}()#+-.!])/g

/**
 * Escape markdown content.
 * @param text - The content to process.
 *
 * @remarks
 * Will add a backslash before the following characters:
 * - `[` --> `\[`
 * - `]` --> `\]`
 * - `|` --> `\|`
 * - `*` --> `\*`
 * - `_` --> `\_`
 * - `~` --> `\~`
 * - `` ` `` --> `` \` ``
 * - `\` --> `\\`
 * - `{` --> `\{`
 * - `}` --> `\}`
 * - `(` --> `\(`
 * - `)` --> `\)`
 * - `#` --> `\#`
 * - `+` --> `\+`
 * - `-` --> `\-`
 * - `.` --> `\.`
 * - `!` --> `\!`
 *
 * @public
 */
export const escapeMD = (text: string): string => text.replace(mdEscapeRE, '\\$1')

/**
 * @param text - The content to process.
 *
 * @beta
 */
export const unescapeMD = (text: string): string => text.replace(/\\([|*_~`])/g, '$1')

/**
 * Escapes a shell command.
 * @param cmd - The command to escape.
 * @returns The escaped command as a string.
 *
 * @beta
 */
export const escapeShell = (_cmd: string): string => {
  return ''
}

/**
 * Escapes a shell argument.
 * @param arg - The argument to escape.
 * @returns The escaped argument as a string.
 *
 * @public
 */
export const escapeShellArg = (arg: string): string => {
  if (/[^A-Za-z0-9_\/:=-]/.test(arg)) {
    return `'${arg.replace(/'/g, "'\\''")}'`
      .replace(/^(?:'')+/g, '') // prevent single quotes from beginning
      .replace(/\\'''/g, "\\'") // remove non-escaped single-quote if there are enclosed between 2 escaped
  }

  return arg
}

/**
 * Escapes shell arguments.
 * @param args - The arguments to escape.
 * @returns The escaped arguments as a string.
 *
 * @public
 */
export const escapeShellArgs = (args: string[]): string => args.map(escapeShellArg).join(' ')
