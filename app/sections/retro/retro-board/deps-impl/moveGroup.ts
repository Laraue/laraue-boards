import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createMoveGroup =
  (client: RetroApiClient): RetroBoardPageDeps['moveGroup'] =>
  ({ deltaX, deltaY, groupId, retroId, sectionId }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.PUT('/api/retro/{id}/groups/{groupId}/position', {
          body: { deltaX, deltaY, sectionId: Number(sectionId) },
          params: { path: { groupId: Number(groupId), id: Number(retroId) } },
        }),
    })
