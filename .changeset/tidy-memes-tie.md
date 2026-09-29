---
"@qingshaner/utility-orpc": major
---

- Breaking: replace `AppContextPlugin` with `nitroPlugin` and require Nitro `^3.0.260903-beta`. Remove the old plugin from the oRPC handler and register `nitroPlugin(options)` as a Nitro runtime plugin. Update `getParentRequestId` callbacks to read `event.req` instead of `options.request`.
- Scope request context to Nitro requests, propagate request IDs to incoming requests and responses, and preserve Server-Timing support. `AppContext` now includes a required `startTime` field.
- Add optional asynchronous request logging and export `onShutdown` and `cleanup` to run shutdown callbacks through Nitro's close hook.
