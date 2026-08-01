import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { JoinOrganization } from '../JoinOrganizationPage.deps'

export const createJoinOrganization =
  (client: ApiClient): JoinOrganization =>
  async ({ code }) => {
    const result = await executeAction({
      map: () => 'joined' as const,
      request: () =>
        client.POST('/api/organizations/join/{code}', {
          params: { path: { code } },
          parseAs: 'text',
        }),
    })

    return result.status === 'error' && result.code === 401
      ? { data: 'sign-in-required', status: 'success' }
      : result
  }
