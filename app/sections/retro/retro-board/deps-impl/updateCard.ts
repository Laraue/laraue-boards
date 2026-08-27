import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createUpdateCard =
  (client: RetroApiClient): RetroBoardPageDeps['updateCard'] =>
  ({ id, text }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.PUT('/api/retro/cards/{cardId}', {
          body: { text },
          params: { path: { cardId: id } },
        }),
    })
