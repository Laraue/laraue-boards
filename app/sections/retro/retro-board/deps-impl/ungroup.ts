import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createUngroup =
  (client: RetroApiClient): RetroBoardPageDeps['ungroup'] =>
  ({ groupId, retroId }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.DELETE('/api/retro/{id}/groups/{groupId}', {
          params: { path: { groupId: Number(groupId), id: Number(retroId) } },
        }),
    })
