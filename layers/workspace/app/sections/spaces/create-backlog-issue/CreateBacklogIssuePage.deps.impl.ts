import type { ApiClient } from '#infrastructure/api/client'
import { ApiError, request } from '#infrastructure/api/request'
import { mapIssueAttributes } from '#layers/workspace/app/sections/issues/shared/api/issueAttributes'
import { createCreateIssueFormDeps } from '#layers/workspace/app/sections/issues/shared/components/CreateIssueForm/CreateIssueForm.deps.impl'

import type { CreateBacklogIssuePageDeps } from './CreateBacklogIssuePage.deps'

export const createCreateBacklogIssuePageDeps = (
  client: ApiClient,
): CreateBacklogIssuePageDeps => ({
  form: createCreateIssueFormDeps(client),

  view: async ({ signal, spaceKey }) => {
    const [spaces, attributes, boards] = await Promise.all([
      request(client.GET('/api/spaces', { signal })),
      request(client.GET('/api/organizations/attributes', { signal })),
      request(
        client.GET('/api/spaces/{key}/epics', { params: { path: { key: spaceKey } }, signal }),
      ),
    ])
    const space = spaces.find((item) => item.key === spaceKey)
    const backlog = boards.find((board) => board.isDefault)
    if (!space || !backlog) {
      throw new ApiError(404)
    }
    const board = await request(
      client.GET('/api/epics/{id}', { params: { path: { id: Number(backlog.id) } }, signal }),
    )
    if (!board.canCreateIssues) {
      throw new ApiError(403)
    }
    return {
      attributes: mapIssueAttributes(attributes),
      boardId: String(backlog.id),
      boardName: backlog.name,
      spaceColor: space.color,
      spaceName: space.name,
    }
  },
})
