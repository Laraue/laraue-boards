import type { OrganizationSelectDeps } from '#layers/workspace/app/sections/organizations/shared/components/OrganizationSelect/OrganizationSelect.deps'

export type MoveSpacesInput = {
  destinationOrganizationId: string
  spaceKeys: string[]
}

export type MoveSpacesDialogDeps = {
  moveSpaces: (input: MoveSpacesInput) => Promise<void>
  organizationSelect: OrganizationSelectDeps
}
