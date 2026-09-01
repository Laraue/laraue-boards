import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createAdvancePhase =
  (client: RetroApiClient): RetroBoardPageDeps['advancePhase'] =>
  ({ phase, retroId }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.POST('/api/retro/{id}/phase/next', {
          body: { phase },
          params: { path: { id: Number(retroId) } },
        }),
    })
