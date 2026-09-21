---
"@qingshaner/utility-orpc": minor
---

- Add `getParentRequestId` to resolve upstream request IDs from fetch interceptor options instead of the configured request header.
- Generate a UUID for nullish IDs and allow empty IDs to suppress request ID propagation.
- Document resolver behavior and cover fallback, disabled features, and error propagation with unit tests.
