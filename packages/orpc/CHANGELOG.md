# @qingshaner/utility-orpc

## 0.2.0

### Minor Changes

- 9886a00: - Add `getParentRequestId` to resolve upstream request IDs from fetch interceptor options instead of the configured request header.
  - Generate a UUID for nullish IDs and allow empty IDs to suppress request ID propagation.
  - Document resolver behavior and cover fallback, disabled features, and error propagation with unit tests.
- 0088868: Add `generateErrorStatusMap` to scan TypeScript source directories for namespaced error codes and generate a typed HTTP status map. Unknown prefixes default to status 500, and unchanged output files are preserved.

## 0.1.0

### Minor Changes

- 23e6b54: - Add oRPC request context and Server-Timing/OpenTelemetry timing utilities.
