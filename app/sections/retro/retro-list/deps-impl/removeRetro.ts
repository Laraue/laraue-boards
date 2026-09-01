import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroListPageDeps } from '../RetroListPage.deps'

export const createRemoveRetro =
  (client: RetroApiClient): RetroListPageDeps['removeRetro'] =>
  ({ retroId }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.DELETE('/api/retro/{id}', { params: { path: { id: Number(retroId) } } }),
    })
