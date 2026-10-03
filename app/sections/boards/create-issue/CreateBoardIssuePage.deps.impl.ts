import type { ApiClient } from '#infrastructure/api/client'
import { ApiError, request } from '#infrastructure/api/request'
import { createCreateIssueFormDeps } from '~/components/create-issue-form/CreateIssueForm.deps.impl'
import { DEFAULT_COLOR } from '~/constants/colors'
import { mapIssueAttributes } from '~/sections/issues/shared/api/issueAttributes'

import type { CreateBoardIssuePageDeps } from './CreateBoardIssuePage.deps'

export const createCreateBoardIssuePageDeps = (client: ApiClient): CreateBoardIssuePageDeps => ({
  form: createCreateIssueFormDeps(client),
  view: async ({ boardId, signal, spaceKey }) => {
    // The board doesn't carry its space's name; the spaces list does.
    const [board, attributes, spaces] = await Promise.all([
      request(client.GET('/api/epics/{id}', { params: { path: { id: Number(boardId) } }, signal })),
      request(client.GET('/api/organizations/attributes', { signal })),
      request(client.GET('/api/spaces', { signal })),
    ])
    if (!board.canCreateIssues) {
      throw new ApiError(403)
    }
    const space = spaces.find((item) => item.key === spaceKey)
    return {
      attributes: mapIssueAttributes(attributes),
      boardColor: board.color ?? DEFAULT_COLOR,
      boardName: board.name,
      spaceColor: space?.color ?? DEFAULT_COLOR,
      spaceName: space?.name ?? spaceKey,
    }
  },
})
