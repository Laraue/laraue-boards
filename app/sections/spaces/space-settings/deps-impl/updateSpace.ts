import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { UpdateSpace } from '../SpaceSettingsPage.deps'

export const createUpdateSpace =
  (client: ApiClient): UpdateSpace =>
  (input) =>
    executeAction({
      map: () => true,
      request: () =>
        client.PUT('/api/spaces/{id}', {
          body: {
            color: input.color,
            id: input.spaceId,
            key: input.key,
            name: input.name,
          },
          params: { path: { id: Number(input.spaceId) } },
        }),
    })
