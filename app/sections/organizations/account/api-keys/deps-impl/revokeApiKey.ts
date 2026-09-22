import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { ApiKeysPageDeps } from '../ApiKeysPage.deps'

export const revokeApiKey =
  (client: ApiClient): ApiKeysPageDeps['revoke'] =>
  ({ id }) =>
    executeAction({
      map: () => true,
      request: () => client.DELETE('/api/api-keys/{id}', { params: { path: { id } } }),
    })
