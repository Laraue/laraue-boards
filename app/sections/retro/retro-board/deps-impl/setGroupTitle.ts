import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createSetGroupTitle =
  (client: RetroApiClient): RetroBoardPageDeps['setGroupTitle'] =>
  ({ groupId, retroId, title }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.PUT('/api/retro/{id}/groups/{groupId}', {
          body: { title },
          params: { path: { groupId: Number(groupId), id: Number(retroId) } },
        }),
    })
