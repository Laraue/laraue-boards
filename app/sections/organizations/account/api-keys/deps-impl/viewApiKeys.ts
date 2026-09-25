import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { ApiKeysPageDeps } from '../ApiKeysPage.deps'

export const createViewApiKeys =
  (client: ApiClient): ApiKeysPageDeps['view'] =>
  ({ page, signal }) =>
    executeQuery({
      map: (result) =>
        result && {
          hasNextPage: result.hasNextPage,
          keys: result.data.map((key) => ({
            createdAt: key.createdAt,
            id: key.id,
            keyPrefix: key.keyPrefix,
            lastUsedAt: key.lastUsedAt ?? null,
            name: key.name,
            revokedAt: key.revokedAt ?? null,
          })),
        },
      request: () =>
        client.POST('/api/api-keys/search', {
          body: { pagination: { page: page - 1, perPage: 20 } },
          signal,
        }),
    })
