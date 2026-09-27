import type { ApiClient } from '#infrastructure/api/client'
import { isErrorResponse, tryRequest } from '#infrastructure/api/tryRequest'
import { getOrganizationKey } from '~/utils/organizationKey'

import type { ViewUserAccount } from '../UserAccountPage.deps'

export const createViewUserAccount =
  (client: ApiClient): ViewUserAccount =>
  async ({ signal }) => {
    const responses = await tryRequest(() =>
      Promise.all([
        client.GET('/api/user', { signal }),
        client.GET('/api/organizations/current', { signal }),
      ]),
    )
    if (!responses) {
      return { code: 0, status: 'error' }
    }

    const [user, organization] = responses
    if (isErrorResponse(user)) {
      return user.response.status === 401
        ? { data: { kind: 'signed-out' }, status: 'success' }
        : { code: user.response.status, status: 'error' }
    }

    return {
      data: {
        kind: 'signed-in',
        // No organization selected yet (or it can't be read): "Back" leads to the organization list.
        lastOrganization: isErrorResponse(organization)
          ? null
          : { key: getOrganizationKey(organization.data), name: organization.data.name },
        user: {
          color: user.data.color,
          initials: user.data.initials ?? '?',
          name: user.data.displayName || user.data.initials || 'User',
        },
      },
      status: 'success',
    }
  }
