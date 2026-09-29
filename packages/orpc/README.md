# @qingshaner/utility-orpc

<p align="center">
<a href="https://jsr.io/@qingshaner/utility-orpc"><img src="https://jsr.io/badges/@qingshaner/utility-orpc" alt="JSR package" /></a>
<a href="https://www.npmjs.com/@qingshaner/utility-orpc" target="_blank"><img src="https://img.shields.io/npm/v/@qingshaner/utility-orpc" alt="NPM Version" /></a>
<img alt="LICENSE" src="https://img.shields.io/github/license/tsingshaner/utility">
<a href="https://github.com/tsingshaner/utility/actions/workflows/ci.yml"><img src="https://github.com/tsingshaner/utility/actions/workflows/ci.yml/badge.svg" alt="unit-test" /></a>
<a href="https://biomejs.dev"><img alt="Linted with Biome" src="https://img.shields.io/badge/Linted_with-Biome-60a5fa?style=flat&logo=biome"></a>
<a href="https://biomejs.dev" target="_blank"><img alt="Static Badge" src="https://img.shields.io/badge/Formatted_with-Biome-60a5fa?style=flat&logo=biome"></a>
</p>

Request context, timing helpers, and error status map generation for oRPC projects.

## Installation

```sh
pnpm add @qingshaner/utility-orpc @orpc/server nitro
```

## Request context

Register `nitroPlugin` as a Nitro runtime plugin. It makes request-local values
available through `getAppContext()` across asynchronous calls, including oRPC handlers.

```ts
// server/plugins/context.ts
import { nitroPlugin } from '@qingshaner/utility-orpc'

export default nitroPlugin({
  features: { serverTiming: true },
  logger: console,
})
```

The optional `logger` accepts an object with `debug(message, props)` and
`info(message, props)` methods. Both may return promises, which the plugin awaits.
Omit `logger` to disable request logging.

Request IDs are enabled by default. The plugin reads `X-Request-ID`, generates a
UUID when the header is absent, propagates it to the request, and returns it on
responses. Use `requestIdHeader` to change the header or `features.requestId: false`
to disable request IDs. Server-Timing collection is disabled by default.

```ts
import { getAppContext } from '@qingshaner/utility-orpc'

const requestId = getAppContext()?.requestId
```

`getAppContext()` returns `undefined` outside a request managed by the plugin.
The plugin wraps Nitro's fetch entry point using Node.js `AsyncLocalStorage`;
it does not require Nitro's experimental async-context option.

To resolve an upstream request ID yourself, provide `getParentRequestId`:

```ts
nitroPlugin({
  getParentRequestId: ({ req }) => req.headers.get('X-Upstream-Request-ID'),
})
```

This callback replaces the default header lookup. Returning `null` or `undefined`
generates a UUID; returning an empty string suppresses the context and response
request ID. The callback is skipped when request IDs are disabled.

This replaces the previous oRPC `AppContextPlugin`: remove it from the handler's
`plugins` array and register the Nitro plugin above. Existing timing helpers remain
available. Register shutdown callbacks with `onShutdown(fn)`; Nitro's close hook
runs all callbacks through `cleanup()` and waits for them to settle.

## Timing

Use `measure` to time a synchronous or asynchronous operation. It returns a promise
for the result, creates an active OpenTelemetry span, and records a Server-Timing
metric when the current request enables that feature.

```ts
import { endTime, measure, setTime, startTime } from '@qingshaner/utility-orpc'

const user = await measure('db.user.find', () => db.findUser(id), {
  description: 'User query',
  attributes: { 'db.system': 'postgresql' },
  precision: 1,
})

setTime('cache', 1.2, 'Cache lookup')
startTime('serialize', 'Response serialization')
const body = JSON.stringify(user)
endTime('serialize')
```

Durations are in milliseconds. `setTime` records an existing duration;
`startTime` and `endTime` measure an interval within the current request. These
three helpers only collect Server-Timing metrics and do nothing when collection is
disabled. Ending a timer that was not started is also a no-op.

`measure` records failures on its span, records the duration, and rethrows the
original error. Configure an OpenTelemetry SDK in your application to export spans;
this package includes only the OpenTelemetry API.

### Rolldown plugin

```ts
import errorCodeMap from '@qingshaner/utility-orpc/plugin/rolldown'

export default {
  plugins: [errorCodeMap({
    sourceDirs: ['./src'],
    outputFile: './src/error-code-map.gen.ts',
  })],
}
```

The plugin generates the map before entry modules load and updates it during
development, including file deletions. Both paths shown above are the defaults.
Use `include` to customize the transform file filter. Unlike the standalone
generator, the plugin throws an error for unknown status prefixes.
