---
'@qingshaner/utility-orpc': minor
---

- Add a Rolldown plugin at `@qingshaner/utility-orpc/plugin/rolldown` that scans TypeScript sources for namespaced error codes and generates a sorted code list, an `ErrorCode` type, a readonly set, and an `isErrorCode` guard.
- Support configurable source directories, output paths, and transform filters, with generation during build startup and watch updates.
- Update build and unused-code analysis entries for the new plugin and add its `unplugin` dependency.
