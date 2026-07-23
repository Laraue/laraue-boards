import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RemoveSpace } from '../SpaceSettingsPage.deps'

export const createRemoveSpace =
  (client: ApiClient): RemoveSpace =>
  ({ spaceId }) =>
    executeAction({
      map: () => true,
      request: () =>
        client.DELETE('/api/spaces/{id}', { params: { path: { id: Number(spaceId) } } }),
    })
