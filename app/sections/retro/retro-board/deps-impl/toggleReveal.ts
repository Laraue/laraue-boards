import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createToggleReveal =
  (client: RetroApiClient): RetroBoardPageDeps['toggleReveal'] =>
  ({ id, revealed }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.POST('/api/retro/cards/{cardId}/reveal', {
          body: { revealed },
          params: { path: { cardId: id } },
        }),
    })
