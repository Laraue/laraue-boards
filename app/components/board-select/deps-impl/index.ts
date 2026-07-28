import type { ApiClient } from '#infrastructure/api/client'

import type { BoardSelectDeps } from '../BoardSelect.deps'
import { createLoadBoards } from './loadBoards'

export const createBoardSelectDeps = (client: ApiClient): BoardSelectDeps => ({
  loadBoards: createLoadBoards(client),
})
