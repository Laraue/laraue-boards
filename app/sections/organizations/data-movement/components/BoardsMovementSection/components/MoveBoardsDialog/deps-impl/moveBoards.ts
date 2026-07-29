import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'

import type { MoveBoards } from '../MoveBoardsDialog.deps'

export const createMoveBoards =
  (client: ApiClient): MoveBoards =>
  async ({ boardIds, destinationOrganizationId, destinationSpaceKey }) => {
    if (!boardIds.length || !destinationOrganizationId || !destinationSpaceKey) {
      return { code: 400, status: 'error' }
    }
    const responses = await tryRequest(() =>
      Promise.all(
        boardIds.map((boardId) =>
          client.POST('/api/movement/move-epic', {
            body: {
              newOrganizationId: Number(destinationOrganizationId),
              newSpaceKey: destinationSpaceKey,
              sourceEpicId: Number(boardId),
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
