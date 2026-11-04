import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { createBoardSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/BoardSelect/BoardSelect.deps.impl'
import { createStatusSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusSelect.deps.impl'
import { createSpaceSelectDeps } from '#layers/workspace/app/sections/spaces/shared/components/SpaceSelect/SpaceSelect.deps.impl'

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
