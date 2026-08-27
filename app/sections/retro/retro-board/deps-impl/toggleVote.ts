import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createToggleVote =
  (client: RetroApiClient): RetroBoardPageDeps['toggleVote'] =>
  ({ id, voted }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.POST('/api/retro/cards/{cardId}/vote', {
          body: { voted },
          params: { path: { cardId: id } },
        }),
    })
