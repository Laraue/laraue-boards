import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RegenerateJoinCode } from '../PermissionsPage.deps'

export const createRegenerateJoinCode =
  (client: ApiClient): RegenerateJoinCode =>
  () =>
    executeAction({
      map: (code) => code || undefined,
      request: () => client.POST('/api/organizations/regenerate-join-code', { parseAs: 'text' }),
    })
