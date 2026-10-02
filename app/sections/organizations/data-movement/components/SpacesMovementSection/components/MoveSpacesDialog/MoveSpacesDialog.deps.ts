import type { OrganizationSelectDeps } from '~/components/organization-select/OrganizationSelect.deps'

export type MoveSpacesInput = {
  destinationOrganizationId: string
  spaceKeys: string[]
}

export type MoveSpacesDialogDeps = {
  moveSpaces: (input: MoveSpacesInput) => Promise<void>
  organizationSelect: OrganizationSelectDeps
}
