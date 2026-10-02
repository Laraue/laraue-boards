import type { ApiClient } from '#infrastructure/api/client'
import { ApiError, request } from '#infrastructure/api/request'

import type { SpaceSettingsPageDeps } from './SpaceSettingsPage.deps'

export const createSpaceSettingsPageDeps = (client: ApiClient): SpaceSettingsPageDeps => ({
  remove: async ({ spaceKey }) => {
    await request(client.DELETE('/api/spaces/{key}', { params: { path: { key: spaceKey } } }))
  },

  update: async ({ color, name, newKey, oldKey }) => {
    await request(
      client.PUT('/api/spaces/{key}', {
        body: { color, name, newKey, oldKey },
        params: { path: { key: oldKey } },
      }),
    )
  },

  // The name and color live in the space list, the permissions in the space itself.
  view: async ({ signal, spaceKey }) => {
    const [spaces, details] = await Promise.all([
      request(client.GET('/api/spaces', { signal })),
      request(client.GET('/api/spaces/{key}', { params: { path: { key: spaceKey } }, signal })),
    ])
    const space = spaces.find((item) => item.key === spaceKey)
    if (!space) {
      throw new ApiError(404)
    }
    return {
      canDelete: details.canDelete,
      canUpdate: details.canUpdate,
      color: space.color,
      name: space.name,
      spaceKey,
    }
  },
})
