import type { ApiClient } from '#infrastructure/api/client'
import { ApiError, request } from '#infrastructure/api/request'
import { createOrganizationSelectDeps } from '~/components/organization-select/OrganizationSelect.deps.impl'
import { createSpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps.impl'

import type { MoveBoardsDialogDeps } from './MoveBoardsDialog.deps'

export const createMoveBoardsDialogDeps = (client: ApiClient): MoveBoardsDialogDeps => ({
  moveBoards: async ({ boardIds, destinationOrganizationId, destinationSpaceKey }) => {
    if (!boardIds.length || !destinationOrganizationId || !destinationSpaceKey) {
      throw new ApiError(400)
    }
    await Promise.all(
      boardIds.map((boardId) =>
        request(
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
  },
  organizationSelect: createOrganizationSelectDeps(client),
  spaceSelect: createSpaceSelectDeps(client),
})
