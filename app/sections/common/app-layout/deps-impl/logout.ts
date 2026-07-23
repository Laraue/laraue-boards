import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'

import type { Logout } from '../AppLayout.deps'

export const createLogout =
  (client: ApiClient): Logout =>
  async () => {
    await tryRequest(() => client.POST('/api/user/logout'))
    return { data: true, status: 'success' }
  }
