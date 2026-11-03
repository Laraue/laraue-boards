import type { OrganizationSelectDeps } from '#layers/workspace/app/sections/organizations/shared/components/OrganizationSelect/OrganizationSelect.deps'
import type { SpaceSelectDeps } from '#layers/workspace/app/sections/spaces/shared/components/SpaceSelect/SpaceSelect.deps'

export type MoveBoardsDestination = {
  boardIds: string[]
  destinationOrganizationId: string
  destinationSpaceKey: string
}

export type MoveBoardsInput = MoveBoardsDestination & {
  // Within the organization: whether the boards' issues lose their values of attributes the new space
  // doesn't use. Moving to another organization removes every value anyway.
  dropUnusedAttributeValues: boolean
}

export type MoveBoardsDialogDeps = {
  moveBoards: (input: MoveBoardsInput) => Promise<void>
  organizationSelect: OrganizationSelectDeps
  spaceSelect: SpaceSelectDeps
  // The names of the attributes the boards' issues have values for that the new space doesn't use.
  unusedAttributes: (input: MoveBoardsDestination) => Promise<string[]>
}
