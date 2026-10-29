import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { OrganizationSelectDeps } from './OrganizationSelect.deps'

export const createOrganizationSelectDeps = (client: ApiClient): OrganizationSelectDeps => ({
  loadOrganizations: async ({ signal }) => {
    const organizations = await request(client.GET('/api/organizations', { signal }))
    return organizations.map((organization) => ({
      label: organization.name,
      value: String(organization.id),
    }))
  },
})
