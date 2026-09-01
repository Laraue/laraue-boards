import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createTransferOwnership =
  (client: RetroApiClient): RetroBoardPageDeps['transferOwnership'] =>
  ({ retroId, userId }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.POST('/api/retro/{id}/owner', {
          body: { userId },
          params: { path: { id: Number(retroId) } },
        }),
    })
