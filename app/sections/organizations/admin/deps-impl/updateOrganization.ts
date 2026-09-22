import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { UpdateOrganization } from '../OrganizationSettingsPage.deps'

export const createUpdateOrganization =
  (client: ApiClient): UpdateOrganization =>
  (input) =>
    executeAction({
      map: () => true,
      request: () =>
        client.PUT('/api/admin/organizations/{id}', {
          body: { color: input.color, id: input.id, name: input.name, slug: input.slug },
          params: { path: { id: Number(input.id) } },
        }),
    })
