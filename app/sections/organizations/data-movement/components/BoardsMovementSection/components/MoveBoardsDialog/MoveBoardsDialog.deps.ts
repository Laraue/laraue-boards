import type { ActionResult } from '#infrastructure/api/apiResult'
import type { OrganizationSelectDeps } from '~/components/organization-select/OrganizationSelect.deps'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'

import type { MoveBoardsInput } from './MoveBoardsDialog.types'

export type MoveBoards = (input: MoveBoardsInput) => Promise<ActionResult<true>>

export type MoveBoardsDialogDeps = {
  moveBoards: MoveBoards
  organizationSelect: OrganizationSelectDeps
  spaceSelect: SpaceSelectDeps
}
