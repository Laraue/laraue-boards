import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { SpaceSelectDeps } from './SpaceSelect.deps'

export const createSpaceSelectDeps = (client: ApiClient): SpaceSelectDeps => ({
  // Another organization's spaces (moving data there), or the current one's.
  // TODO: only MoveBoardsDialog passes organizationId; give it its own loadSpaces over the
  // movement endpoint and keep this one on /api/spaces without the branch.
  loadSpaces: async ({ organizationId, signal }) => {
    const spaces = await request(
      organizationId
        ? client.GET('/api/movement/organization/{id}/spaces', {
            params: { path: { id: Number(organizationId) } },
            signal,
          })
        : client.GET('/api/spaces', { signal }),
    )
    return spaces.map((space) => ({ color: space.color, label: space.name, value: space.key }))
  },
})
