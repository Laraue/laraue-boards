import type { ApiClient } from '#infrastructure/api/client'

import { createMoveSpacesDialogDeps } from '../components/MoveSpacesDialog/deps-impl'
import type { SpacesMovementSectionDeps } from '../SpacesMovementSection.deps'

export const createSpacesMovementSectionDeps = (client: ApiClient): SpacesMovementSectionDeps => ({
  dialog: createMoveSpacesDialogDeps(client),
})
