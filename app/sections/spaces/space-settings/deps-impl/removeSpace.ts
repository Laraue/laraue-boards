import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RemoveSpace } from '../SpaceSettingsPage.deps'

export const createRemoveSpace =
  (client: ApiClient): RemoveSpace =>
  ({ spaceKey }) =>
    executeAction({
      map: () => true,
      request: () => client.DELETE('/api/spaces/{key}', { params: { path: { key: spaceKey } } }),
    })
