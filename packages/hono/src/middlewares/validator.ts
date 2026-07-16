import { sValidator } from '@hono/standard-validator'
import { flatten } from 'valibot'

import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { ValidationTargets } from 'hono'

type Args = Parameters<NonNullable<Parameters<typeof sValidator>[2]>>

// biome-ignore lint/nursery/useExplicitType: for generic type inference
const validateHandler = (result: Args[0], c: Args[1]) => {
  if (!result.success) {
    return c.json(
      {
        code: 'ERR_BAD_REQUEST_ARGS',
        data: flatten(result.error as unknown as Parameters<typeof flatten>[0]),
        message: `Invalid ${result.target}`
      },
      400
    )
  }
}

// biome-ignore lint/nursery/useExplicitType: for generic type inference
export const validator = <T extends keyof ValidationTargets, U extends StandardSchemaV1>(target: T, schema: U) =>
  sValidator(target, schema, validateHandler)
