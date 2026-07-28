import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { UpdateSpace } from '../SpaceSettingsPage.deps'

export const createUpdateSpace =
  (client: ApiClient): UpdateSpace =>
  (input) =>
    executeAction({
      map: () => true,
      request: () =>
        client.PUT('/api/spaces/{key}', {
          body: {
            color: input.color,
            name: input.name,
            newKey: input.newKey,
            oldKey: input.oldKey,
          },
          params: { path: { key: input.oldKey } },
        }),
    })
