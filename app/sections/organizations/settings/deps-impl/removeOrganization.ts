import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RemoveOrganization } from '../OrganizationSettingsPage.deps'

export const createRemoveOrganization =
  (client: ApiClient): RemoveOrganization =>
  ({ id }) =>
    executeAction({
      map: () => true,
      request: () =>
        client.DELETE('/api/admin/organizations/{id}', { params: { path: { id: Number(id) } } }),
    })
