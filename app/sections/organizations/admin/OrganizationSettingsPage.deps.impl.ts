import type { ApiClient } from '#infrastructure/api/client'
import { ApiError, request } from '#infrastructure/api/request'
import { DEFAULT_COLOR } from '~/constants/colors'

import type { OrganizationSettingsPageDeps } from './OrganizationSettingsPage.deps'

export const createOrganizationSettingsPageDeps = (
  client: ApiClient,
): OrganizationSettingsPageDeps => ({
  remove: async ({ id }) => {
    await request(
      client.DELETE('/api/admin/organizations/{id}', { params: { path: { id: Number(id) } } }),
    )
  },

  updateOrganization: async ({ color, id, name, slug }) => {
    await request(
      client.PUT('/api/admin/organizations/{id}', {
        body: { color, id, name, slug },
        params: { path: { id: Number(id) } },
      }),
    )
  },

  // The permissions live in the organization list, the settings in the current organization.
  view: async ({ signal }) => {
    const [current, organizations] = await Promise.all([
      request(client.GET('/api/organizations/current', { signal })),
      request(client.GET('/api/organizations', { signal })),
    ])
    const organization = organizations.find((item) => String(item.id) === String(current.id))
    if (!organization) {
      throw new ApiError(404)
    }
    return {
      canDelete: organization.canDelete,
      canUpdate: organization.canUpdate,
      color: current.color ?? DEFAULT_COLOR,
      id: String(current.id),
      name: current.name,
      slug: current.slug,
    }
  },
})
