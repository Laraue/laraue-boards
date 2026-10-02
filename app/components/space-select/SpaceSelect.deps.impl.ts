import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { SpaceSelectDeps } from './SpaceSelect.deps'

export const createSpaceSelectDeps = (client: ApiClient): SpaceSelectDeps => ({
  // Another organization's spaces (moving data there), or the current one's.
  loadSpaces: async ({ organizationId, signal }) => {
    const spaces = await request(
      organizationId
        ? client.GET('/api/movement/organization/{id}/spaces', {
            params: { path: { id: Number(organizationId) } },
            signal,
          })
        : client.GET('/api/spaces', { signal }),
    )
    return spaces.map((space) => ({ label: space.name, value: space.key }))
  },
})
