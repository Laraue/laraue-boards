import type { ApiClient } from '#infrastructure/api/client'

import type { PermissionsPageDeps } from '../PermissionsPage.deps'
import { createRegenerateJoinCode } from './regenerateJoinCode'
import { createViewPermissions } from './viewPermissions'

export const createPermissionsPageDeps = (client: ApiClient): PermissionsPageDeps => ({
  regenerateJoinCode: createRegenerateJoinCode(client),
  view: createViewPermissions(client),
})
