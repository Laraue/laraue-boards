import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createCreateCard =
  (client: RetroApiClient): RetroBoardPageDeps['createCard'] =>
  ({ retroId, sectionId, text, x, y }) =>
    executeAction({
      map: (created) => (created ? { id: created.id } : undefined),
      request: () =>
        client.POST('/api/retro/{id}/cards', {
          body: { sectionId: Number(sectionId), text, x, y },
          params: { path: { id: Number(retroId) } },
        }),
    })
