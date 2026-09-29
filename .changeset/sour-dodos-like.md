---
"@qingshaner/utility-orpc": major
"@qingshaner/utility-shared": patch
---

- Breaking: remove `generateErrorStatusMap` from `@qingshaner/utility-orpc`. Migrate to the default plugin export from `@qingshaner/utility-orpc/plugin/rolldown`.
- Breaking: replace the plugin's generated `errorCodes`, `errorCodeSet`, and `isErrorCode` exports with `ErrorStatusMap`, retaining the `ErrorCode` type. The generated module imports `COMMON_ERROR_STATUS_MAP` from `@orpc/openapi`, which must be available in the consuming project. Unknown status prefixes now fail generation.
- Normalize module paths during build and watch updates, and skip writing unchanged generated output.
- Document request context, timing helpers, and plugin usage; update the oRPC development dependency and repository tooling.
- Update `@qingshaner/utility-shared` to depend on `type-fest` version `^5.10.0`.
