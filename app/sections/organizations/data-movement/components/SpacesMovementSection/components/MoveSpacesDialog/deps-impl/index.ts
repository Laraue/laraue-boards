import type { ApiClient } from '#infrastructure/api/client'
import { createOrganizationSelectDeps } from '~/components/organization-select/deps-impl'

import type { MoveSpacesDialogDeps } from '../MoveSpacesDialog.deps'
import { createMoveSpaces } from './moveSpaces'

export const createMoveSpacesDialogDeps = (client: ApiClient): MoveSpacesDialogDeps => ({
  moveSpaces: createMoveSpaces(client),
  organizationSelect: createOrganizationSelectDeps(client),
})
