---
"@qingshaner/utility-server": minor
"@qingshaner/utility-client": patch
"@qingshaner/utility-shared": patch
---

- Add `promisifyExecFile` for promise-based execution of files with Node.js.
- Fix client package import and default exports to resolve to `dist/index.mjs`.
- Allow Node.js type definitions from version 22.13.10 onward and update `type-fest`.
- Update repository tooling and CI checks, migrate benchmarks to Vitest 5, and make debounce timer tests deterministic.
