import type { ApiClient } from '#infrastructure/api/client'

import type { CreateBoardPageDeps } from '../CreateBoardPage.deps'
import { createCreateBoard } from './createBoard'

export const createCreateBoardPageDeps = (client: ApiClient): CreateBoardPageDeps => ({
  create: createCreateBoard(client),
})
