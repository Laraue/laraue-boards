import type { ActionResult } from '#infrastructure/api/apiResult'
import type { OrganizationSelectDeps } from '~/components/organization-select/OrganizationSelect.deps'

import type { MoveSpacesInput } from './MoveSpacesDialog.types'

export type MoveSpaces = (input: MoveSpacesInput) => Promise<ActionResult<true>>

export type MoveSpacesDialogDeps = {
  moveSpaces: MoveSpaces
  organizationSelect: OrganizationSelectDeps
}
