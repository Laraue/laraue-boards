import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createMoveCard =
  (client: RetroApiClient): RetroBoardPageDeps['moveCard'] =>
  ({ groupId, id, sectionId, x, y }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.PUT('/api/retro/cards/{cardId}/position', {
          body: {
            groupId: groupId === null ? null : Number(groupId),
            sectionId: Number(sectionId),
            x,
            y,
          },
          params: { path: { cardId: id } },
        }),
    })
