import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { LoadSpaces } from '../SpaceSelect.deps'

export const createLoadSpaces =
  (client: ApiClient): LoadSpaces =>
  ({ organizationId, signal }) =>
    executeQuery({
      map: (spaces) => spaces?.map((space) => ({ label: space.name, value: String(space.id) })),
      request: () =>
        organizationId
          ? client.GET('/api/movement/organization/{id}/spaces', {
              params: { path: { id: Number(organizationId) } },
              signal,
            })
          : client.GET('/api/spaces', { signal }),
    })
