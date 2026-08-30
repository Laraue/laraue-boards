import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createUpdateSettings =
  (client: RetroApiClient): RetroBoardPageDeps['updateSettings'] =>
  ({ phase, retroId, votesPerUser }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.POST('/api/retro/{id}/settings', {
          body: { phase, votesPerUser },
          params: { path: { id: Number(retroId) } },
        }),
    })
