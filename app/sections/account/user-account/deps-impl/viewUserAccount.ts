import type { ApiClient } from '#infrastructure/api/client'
import { isErrorResponse, tryRequest } from '#infrastructure/api/tryRequest'

import type { ViewUserAccount } from '../UserAccountPage.deps'

export const createViewUserAccount =
  (client: ApiClient): ViewUserAccount =>
  async ({ signal }) => {
    const user = await tryRequest(() => client.GET('/api/user', { signal }))
    if (!user) {
      return { code: 0, status: 'error' }
    }
    if (isErrorResponse(user)) {
      return user.response.status === 401
        ? { data: { kind: 'signed-out' }, status: 'success' }
        : { code: user.response.status, status: 'error' }
    }

    return {
      data: {
        kind: 'signed-in',
        user: {
          color: user.data.color,
          initials: user.data.initials ?? '?',
          name: user.data.displayName || user.data.initials || 'User',
        },
      },
      status: 'success',
    }
  }
