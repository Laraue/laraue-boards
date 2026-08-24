import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'

import type { CreateBoardInput, CreateBoardPageData } from './CreateBoardPage.types'

export type CreateBoard = (input: CreateBoardInput) => Promise<ActionResult<{ boardId: string }>>

export type CreateBoardPageDeps = {
  create: CreateBoard
  view: (input: {
    signal?: AbortSignal
    spaceKey: string
  }) => Promise<QueryResult<CreateBoardPageData>>
}
