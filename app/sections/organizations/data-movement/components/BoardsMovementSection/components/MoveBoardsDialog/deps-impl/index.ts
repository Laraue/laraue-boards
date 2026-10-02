import type { ApiClient } from '#infrastructure/api/client'
import { createOrganizationSelectDeps } from '~/components/organization-select/OrganizationSelect.deps.impl'
import { createSpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps.impl'

import type { MoveBoardsDialogDeps } from '../MoveBoardsDialog.deps'
import { createMoveBoards } from './moveBoards'

export const createMoveBoardsDialogDeps = (client: ApiClient): MoveBoardsDialogDeps => ({
  moveBoards: createMoveBoards(client),
  organizationSelect: createOrganizationSelectDeps(client),
  spaceSelect: createSpaceSelectDeps(client),
})
