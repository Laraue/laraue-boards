import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { ApiKeysPageDeps } from '../ApiKeysPage.deps'

export const createApiKey =
  (client: ApiClient): ApiKeysPageDeps['create'] =>
  ({ name }) =>
    executeAction({
      map: (result) => result,
      request: () => client.POST('/api/api-keys', { body: { name } }),
    })
