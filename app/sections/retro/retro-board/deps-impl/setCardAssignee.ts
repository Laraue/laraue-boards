import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createSetCardAssignee =
  (client: RetroApiClient): RetroBoardPageDeps['setCardAssignee'] =>
  ({ assigneeId, id }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.POST('/api/retro/cards/{cardId}/assignee', {
          body: { assigneeId },
          params: { path: { cardId: id } },
        }),
    })
