import type { ActionResult } from '#infrastructure/api/apiResult'

import type { CreateSpaceInput } from './CreateSpacePage.types'

export type CreateSpace = (input: CreateSpaceInput) => Promise<ActionResult<{ spaceKey: string }>>

export type CreateSpacePageDeps = {
  create: CreateSpace
}
