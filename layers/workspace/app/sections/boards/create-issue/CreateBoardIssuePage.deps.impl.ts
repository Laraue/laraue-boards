import type { ApiClient } from '#infrastructure/api/client'
import { ApiError, request } from '#infrastructure/api/request'
import { createCreateIssueFormDeps } from '#layers/workspace/app/sections/issues/shared/components/CreateIssueForm/CreateIssueForm.deps.impl'
import { DEFAULT_COLOR } from '#layers/workspace/app/shared/constants/colors'
import type { ReadOrganizationCatalog } from '#layers/workspace/app/shells/organization/AppLayout.deps'

import type { CreateBoardIssuePageDeps } from './CreateBoardIssuePage.deps'

export const createCreateBoardIssuePageDeps = (
  client: ApiClient,
  readCatalog: ReadOrganizationCatalog,
): CreateBoardIssuePageDeps => ({
  form: createCreateIssueFormDeps(client),
  view: async ({ boardId, signal, spaceKey }) => {
    // The board doesn't carry its space's name; the layout's spaces list does.
    const { attributes, spaces } = readCatalog()
    const board = await request(
      client.GET('/api/epics/{id}', { params: { path: { id: Number(boardId) } }, signal }),
    )
    if (!board.canCreateIssues) {
      throw new ApiError(403)
    }
    const space = spaces.find((item) => item.key === spaceKey)
    return {
      attributes,
      boardColor: board.color ?? DEFAULT_COLOR,
      boardName: board.name,
      spaceColor: space?.color ?? DEFAULT_COLOR,
      spaceName: space?.name ?? spaceKey,
    }
  },
})
