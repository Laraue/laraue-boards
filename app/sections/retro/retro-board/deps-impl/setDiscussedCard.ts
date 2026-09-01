import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createSetDiscussedCard =
  (client: RetroApiClient): RetroBoardPageDeps['setDiscussedCard'] =>
  ({ cardId, retroId }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.POST('/api/retro/{id}/discussed-card', {
          body: { cardId },
          params: { path: { id: Number(retroId) } },
        }),
    })
