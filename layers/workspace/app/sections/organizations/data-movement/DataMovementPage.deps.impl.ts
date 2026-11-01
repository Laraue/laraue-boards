import type { ApiClient } from '#infrastructure/api/client'
import { ApiError, isApiError, request } from '#infrastructure/api/request'
import { COLORS } from '#layers/workspace/app/shared/constants/colors'
import type { ReadOrganizationCatalog } from '#layers/workspace/app/shells/organization/AppLayout.deps'

import { createMoveBoardsDialogDeps } from './components/BoardsMovementSection/components/MoveBoardsDialog/MoveBoardsDialog.deps.impl'
import { createMoveSpacesDialogDeps } from './components/SpacesMovementSection/components/MoveSpacesDialog/MoveSpacesDialog.deps.impl'
import type { DataMovementPageDeps } from './DataMovementPage.deps'

export const createDataMovementPageDeps = (
  client: ApiClient,
  readCatalog: ReadOrganizationCatalog,
): DataMovementPageDeps => ({
  boardsMovementSection: { dialog: createMoveBoardsDialogDeps(client) },
  spacesMovementSection: { dialog: createMoveSpacesDialogDeps(client) },

  view: async ({ signal }) => {
    // The boards are asked together with the access check; the spaces come from the layout.
    const { spaces } = readCatalog()
    const [current, boardsBySpace] = await Promise.all([
      // A current organization that is not found is treated the same as access denied.
      request(client.GET('/api/organizations/current', { signal })).catch((error: unknown) => {
        throw isApiError(error, 404) ? new ApiError(403) : error
      }),
      Promise.all(
        spaces.map((space) =>
          request(
            client.GET('/api/spaces/{key}/epics', { params: { path: { key: space.key } }, signal }),
          ),
        ),
      ),
    ])
    if (!current.canMassMove) {
      throw new ApiError(403)
    }
    return {
      currentOrganizationId: String(current.id),
      currentOrganizationName: current.name,
      spaces: spaces.map((space, index) => ({
        boards: boardsBySpace[index]!.filter((board) => !board.isDefault).map((board) => ({
          color: board.color ?? COLORS.gray,
          id: String(board.id),
          name: board.name,
        })),
        color: space.color,
        key: space.key,
        name: space.name,
      })),
    }
  },
})
