# 🛠️ Utility

<p align="center">
<a href="https://jsr.io/@qingshaner/utility"><img src="https://jsr.io/badges/@qingshaner/utility" alt="JSR package" /></a>
<a href="https://www.npmjs.com/@qingshaner/utility" target="_blank"><img src="https://img.shields.io/npm/v/@qingshaner/utility" alt="NPM Version" /></a>
<img alt="LICENSE" src="https://img.shields.io/github/license/tsingshaner/utility">
<a href="https://github.com/tsingshaner/utility/actions/workflows/ci.yml"><img src="https://github.com/tsingshaner/utility/actions/workflows/ci.yml/badge.svg" alt="unit-test" /></a>
<a href="https://biomejs.dev"><img alt="Linted with Biome" src="https://img.shields.io/badge/Linted_with-Biome-60a5fa?style=flat&logo=biome"></a>
<a href="https://biomejs.dev" target="_blank"><img alt="Static Badge" src="https://img.shields.io/badge/Formatted_with-Biome-60a5fa?style=flat&logo=biome"></a>
</p>

This is a utility package for JavaScript, including client, server, and shared utilities.

- `@qingshaner/utility-client`: Utility functions that depend on the server-side.
- `@qingshaner/utility-server`: Utility functions that depend on the browser client.
- `@qingshaner/utility-shared`: Utility functions shared between the browser and the server.

## Install

```bash
npm i -P @qingshaner/utility
```

## Usage

`// client.ts`
```ts
import * as sharedUtils from '@qingshaner/utility'
import * as clientUtils from '@qingshaner/utility/client'

// ... Your code will run in browser environment.

```

`// server.ts`
```ts
import * as sharedUtils from '@qingshaner/utility'
import * as serverUtils from '@qingshaner/utility/server'

// ... Your code will run in nodejs or other server side environment.

```
