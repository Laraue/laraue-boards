import type { OrganizationSelectDeps } from '~/components/organization-select/OrganizationSelect.deps'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'

export type MoveBoardsInput = {
  boardIds: string[]
  destinationOrganizationId: string
  destinationSpaceKey: string
}

export type MoveBoardsDialogDeps = {
  moveBoards: (input: MoveBoardsInput) => Promise<void>
  organizationSelect: OrganizationSelectDeps
  spaceSelect: SpaceSelectDeps
}
