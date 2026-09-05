import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createGroupCards =
  (client: RetroApiClient): RetroBoardPageDeps['groupCards'] =>
  ({ cards, retroId }) =>
    executeAction({
      map: (created) => (created ? { id: String(created.id) } : undefined),
      request: () =>
        client.POST('/api/retro/{id}/groups', {
          body: { cards },
          params: { path: { id: Number(retroId) } },
        }),
    })
