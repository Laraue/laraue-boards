import type { ApiClient } from '#infrastructure/api/client'

import type { PermissionsPageDeps } from '../PermissionsPage.deps'
import { createViewPermissions } from './viewPermissions'

export const createPermissionsPageDeps = (client: ApiClient): PermissionsPageDeps => ({
  view: createViewPermissions(client),
})
