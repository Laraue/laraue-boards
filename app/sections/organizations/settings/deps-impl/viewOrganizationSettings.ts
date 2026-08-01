import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { DEFAULT_COLOR } from '~/constants/colors'

import type { ViewOrganizationSettings } from '../OrganizationSettingsPage.deps'

export const createViewOrganizationSettings =
  (client: ApiClient): ViewOrganizationSettings =>
  async ({ signal }) => {
    const responses = await tryRequest(() =>
      Promise.all([
        client.GET('/api/organizations/current', { signal }),
        client.GET('/api/organizations', { signal }),
      ]),
    )
    if (!responses) {
      return { code: 0, status: 'error' }
    }
    const [current, organizations] = responses
    if ('error' in current) {
      return { code: current.response.status, status: 'error' }
    }
    if ('error' in organizations) {
      return { code: organizations.response.status, status: 'error' }
    }
    const organization = organizations.data.find(
      (item) => String(item.id) === String(current.data.id),
    )
    if (!organization) {
      throw new Error('Current organization is absent from organization list')
    }
    return {
      data: {
        canDelete: organization.canDelete,
        canUpdate: organization.canUpdate,
        color: current.data.color ?? DEFAULT_COLOR,
        id: String(current.data.id),
        name: current.data.name,
        slug: current.data.slug,
      },
      status: 'success',
    }
  }
