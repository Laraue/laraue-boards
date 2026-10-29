import type { OrganizationSelectDeps } from '#layers/workspace/app/sections/organizations/shared/components/OrganizationSelect/OrganizationSelect.deps'
import type { SpaceSelectDeps } from '#layers/workspace/app/sections/spaces/shared/components/SpaceSelect/SpaceSelect.deps'

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
