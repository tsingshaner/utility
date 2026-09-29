import { H3, type HTTPEvent } from 'nitro/h3'

import type { NitroAppPlugin, NitroRuntimeHooks } from 'nitro/types'

import { type NitroPluginOptions, nitroPlugin } from './nitro'

export const createTestApp = (
  options: NitroPluginOptions = {},
  handler: (event: HTTPEvent) => unknown = () => ''
): Parameters<NitroAppPlugin>[0] => {
  const callbacks: Partial<NitroRuntimeHooks> = {}
  const h3 = new H3({
    onRequest: (event: HTTPEvent): void | Promise<void> => callbacks.request?.(event),
    onResponse: (response: Response, event: HTTPEvent): void | Promise<void> => callbacks.response?.(response, event)
  })
  h3.use(handler)
  const app = {
    fetch: (request: Request): Response | Promise<Response> => h3.fetch(request),
    hooks: {
      hook: <K extends keyof NitroRuntimeHooks>(name: K, callback: NitroRuntimeHooks[K]): void => {
        callbacks[name] = callback
      }
    } as Parameters<NitroAppPlugin>[0]['hooks']
  }
  nitroPlugin(options)(app)
  return app
}
