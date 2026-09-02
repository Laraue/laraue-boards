import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createResetVotes =
  (client: RetroApiClient): RetroBoardPageDeps['resetVotes'] =>
  ({ retroId }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.DELETE('/api/retro/{id}/votes', { params: { path: { id: Number(retroId) } } }),
    })
