import type { RetroApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'
import { mapRetro } from './mapRetro'

export const createViewRetro =
  (client: RetroApiClient): RetroBoardPageDeps['view'] =>
  ({ retroId, signal }) =>
    executeQuery({
      map: (retro) => {
        if (!retro) {
          return undefined
        }
        return mapRetro(retro)
      },
      request: () =>
        client.GET('/api/retro/{id}', { params: { path: { id: Number(retroId) } }, signal }),
    })
