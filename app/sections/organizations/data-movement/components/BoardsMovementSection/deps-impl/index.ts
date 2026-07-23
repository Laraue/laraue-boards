import type { ApiClient } from '#infrastructure/api/client'

import type { BoardsMovementSectionDeps } from '../BoardsMovementSection.deps'
import { createMoveBoardsDialogDeps } from '../components/MoveBoardsDialog/deps-impl'

export const createBoardsMovementSectionDeps = (client: ApiClient): BoardsMovementSectionDeps => ({
  dialog: createMoveBoardsDialogDeps(client),
})
