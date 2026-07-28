import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'

import type { MoveBoards } from '../MoveBoardsDialog.deps'

export const createMoveBoards =
  (client: ApiClient): MoveBoards =>
  async ({ boardIds, destinationSpaceKey }) => {
    if (!boardIds.length || !destinationSpaceKey) {
      return { code: 400, status: 'error' }
    }
    const responses = await tryRequest(() =>
      Promise.all(
        boardIds.map((boardId) =>
          client.POST('/api/movement/epic/{id}/to-space/{newSpaceKey}', {
            params: {
              path: { id: Number(boardId), newSpaceKey: destinationSpaceKey },
            },
          }),
        ),
      ),
    )
    if (!responses) {
      return { code: 0, status: 'error' }
    }
    for (const response of responses) {
      if ('error' in response) {
        return { code: response.response.status, status: 'error' }
      }
    }
    return { data: true, status: 'success' }
  }
