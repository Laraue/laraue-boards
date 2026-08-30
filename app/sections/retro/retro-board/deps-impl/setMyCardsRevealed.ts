import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createSetMyCardsRevealed =
  (client: RetroApiClient): RetroBoardPageDeps['setMyCardsRevealed'] =>
  ({ retroId, revealed }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.POST('/api/retro/{id}/reveal-mine', {
          body: { revealed },
          params: { path: { id: Number(retroId) } },
        }),
    })
