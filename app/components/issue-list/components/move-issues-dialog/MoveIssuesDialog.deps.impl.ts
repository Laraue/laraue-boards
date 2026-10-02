import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { createBoardSelectDeps } from '~/components/board-select/BoardSelect.deps.impl'
import { createSpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps.impl'
import { createStatusSelectDeps } from '~/components/status-select/StatusSelect.deps.impl'

import type { MoveIssuesDialogDeps } from './MoveIssuesDialog.deps'

export const createMoveIssuesDialogDeps = (client: ApiClient): MoveIssuesDialogDeps => ({
  boardSelect: createBoardSelectDeps(client),
  moveIssues: async ({ issueKeys, statusId }) => {
    await request(
      client.POST('/api/issues/status', { body: { issueKeys, statusId: Number(statusId) } }),
    )
  },
  spaceSelect: createSpaceSelectDeps(client),
  statusSelect: createStatusSelectDeps(client),
})
