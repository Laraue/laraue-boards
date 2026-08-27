import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createFinishRetro =
  (client: RetroApiClient): RetroBoardPageDeps['finishRetro'] =>
  ({ retroId }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.POST('/api/retro/{id}/finish', { params: { path: { id: Number(retroId) } } }),
    })
