import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createRenameRetro =
  (client: RetroApiClient): RetroBoardPageDeps['renameRetro'] =>
  ({ name, retroId }) =>
    executeAction({
      map: () => true as const,
      request: () =>
        client.PUT('/api/retro/{id}/name', {
          body: { name },
          params: { path: { id: Number(retroId) } },
        }),
    })
