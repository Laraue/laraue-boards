import type { ActionResult } from '#infrastructure/api/apiResult'

import type { CreateBoardInput } from './CreateBoardPage.types'

export type CreateBoard = (input: CreateBoardInput) => Promise<ActionResult<{ boardId: string }>>

export type CreateBoardPageDeps = {
  create: CreateBoard
}
