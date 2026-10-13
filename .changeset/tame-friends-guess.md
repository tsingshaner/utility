---
'@qingshaner/utility-orpc': patch
---

- Exclude generated output from error code collection so removed codes do not remain in the generated map, including when using a custom output filename.
- Serialize overlapping build and watch updates to avoid unnecessary output rewrites, and allow later updates to recover after generation fails.
