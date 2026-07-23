import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { LoadOrganizations } from '../OrganizationSelect.deps'

export const createLoadOrganizations =
  (client: ApiClient): LoadOrganizations =>
  ({ signal }) =>
    executeQuery({
      map: (organizations) =>
        organizations?.map((organization) => ({
          label: organization.name,
          value: String(organization.id),
        })),
      request: () => client.GET('/api/organizations', { signal }),
    })
