import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createSetPhaseTimer =
  (client: RetroApiClient): RetroBoardPageDeps['setPhaseTimer'] =>
  ({ minutes, retroId }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.POST('/api/retro/{id}/timer', {
          body: { minutes },
          params: { path: { id: Number(retroId) } },
        }),
    })
