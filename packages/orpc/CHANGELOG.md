# @qingshaner/utility-orpc

## 1.0.0

### Major Changes

- 1a1deac: - Breaking: remove `generateErrorStatusMap` from `@qingshaner/utility-orpc`. Migrate to the default plugin export from `@qingshaner/utility-orpc/plugin/rolldown`.
  - Breaking: replace the plugin's generated `errorCodes`, `errorCodeSet`, and `isErrorCode` exports with `ErrorStatusMap`, retaining the `ErrorCode` type. The generated module imports `COMMON_ERROR_STATUS_MAP` from `@orpc/openapi`, which must be available in the consuming project. Unknown status prefixes now fail generation.
  - Normalize module paths during build and watch updates, and skip writing unchanged generated output.
  - Document request context, timing helpers, and plugin usage; update the oRPC development dependency and repository tooling.
  - Update `@qingshaner/utility-shared` to depend on `type-fest` version `^5.10.0`.
- 9b579a6: - Breaking: replace `AppContextPlugin` with `nitroPlugin` and require Nitro `^3.0.260903-beta`. Remove the old plugin from the oRPC handler and register `nitroPlugin(options)` as a Nitro runtime plugin. Update `getParentRequestId` callbacks to read `event.req` instead of `options.request`.
  - Scope request context to Nitro requests, propagate request IDs to incoming requests and responses, and preserve Server-Timing support. `AppContext` now includes a required `startTime` field.
  - Add optional asynchronous request logging and export `onShutdown` and `cleanup` to run shutdown callbacks through Nitro's close hook.

## 0.3.0

### Minor Changes

- 854f835: - Add a Rolldown plugin at `@qingshaner/utility-orpc/plugin/rolldown` that scans TypeScript sources for namespaced error codes and generates a sorted code list, an `ErrorCode` type, a readonly set, and an `isErrorCode` guard.
  - Support configurable source directories, output paths, and transform filters, with generation during build startup and watch updates.
  - Update build and unused-code analysis entries for the new plugin and add its `unplugin` dependency.

## 0.2.0

### Minor Changes

- 9886a00: - Add `getParentRequestId` to resolve upstream request IDs from fetch interceptor options instead of the configured request header.
  - Generate a UUID for nullish IDs and allow empty IDs to suppress request ID propagation.
  - Document resolver behavior and cover fallback, disabled features, and error propagation with unit tests.
- 0088868: Add `generateErrorStatusMap` to scan TypeScript source directories for namespaced error codes and generate a typed HTTP status map. Unknown prefixes default to status 500, and unchanged output files are preserved.

## 0.1.0

### Minor Changes

- 23e6b54: - Add oRPC request context and Server-Timing/OpenTelemetry timing utilities.
