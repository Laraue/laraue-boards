import type { ApiClient } from '#infrastructure/api/client'

import { createBoardsMovementSectionDeps } from '../components/BoardsMovementSection/deps-impl'
import { createSpacesMovementSectionDeps } from '../components/SpacesMovementSection/deps-impl'
import type { DataMovementPageDeps } from '../DataMovementPage.deps'
import { createViewDataMovement } from './viewDataMovement'

export const createDataMovementPageDeps = (client: ApiClient): DataMovementPageDeps => ({
  boardsMovementSection: createBoardsMovementSectionDeps(client),
  spacesMovementSection: createSpacesMovementSectionDeps(client),
  view: createViewDataMovement(client),
})
