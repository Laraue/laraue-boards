import type { ActionResult } from '#infrastructure/api/apiResult'

import type { CreateAttributeInput } from './CreateAttributePage.types'

export type CreateAttribute = (input: CreateAttributeInput) => Promise<ActionResult<{ id: string }>>

export type CreateAttributePageDeps = {
  create: CreateAttribute
}
