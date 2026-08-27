import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createRemoveCard =
  (client: RetroApiClient): RetroBoardPageDeps['removeCard'] =>
  ({ id }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.DELETE('/api/retro/cards/{cardId}', { params: { path: { cardId: id } } }),
    })
