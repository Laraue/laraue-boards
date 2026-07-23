import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RemoveBoard } from '../BoardSettingsPage.deps'

export const createRemoveBoard =
  (client: ApiClient): RemoveBoard =>
  ({ boardId }) =>
    executeAction({
      map: () => true,
      request: () =>
        client.DELETE('/api/epics/{id}', { params: { path: { id: Number(boardId) } } }),
    })
