import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { ApiKeysPageDeps } from './ApiKeysPage.deps'

export const createApiKeysPageDeps = (client: ApiClient): ApiKeysPageDeps => ({
  create: ({ name }) => request(client.POST('/api/api-keys', { body: { name } })),

  revoke: async ({ id }) => {
    await request(client.DELETE('/api/api-keys/{id}', { params: { path: { id } } }))
  },

  view: async ({ page, signal }) => {
    const result = await request(
      client.POST('/api/api-keys/search', {
        body: { pagination: { page: page - 1, perPage: 20 } },
        signal,
      }),
    )
    return {
      hasNextPage: result.hasNextPage,
      keys: result.data.map((key) => ({
        createdAt: key.createdAt,
        id: key.id,
        keyPrefix: key.keyPrefix,
        lastUsedAt: key.lastUsedAt ?? null,
        name: key.name,
        revokedAt: key.revokedAt ?? null,
      })),
    }
  },
})
