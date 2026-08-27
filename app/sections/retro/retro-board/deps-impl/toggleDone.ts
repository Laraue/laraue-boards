import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createToggleDone =
  (client: RetroApiClient): RetroBoardPageDeps['toggleDone'] =>
  ({ done, id }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.POST('/api/retro/cards/{cardId}/done', {
          body: { done },
          params: { path: { cardId: id } },
        }),
    })
