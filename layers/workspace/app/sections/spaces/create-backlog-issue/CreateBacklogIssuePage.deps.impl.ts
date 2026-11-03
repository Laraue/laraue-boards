import type { ApiClient } from '#infrastructure/api/client'
import { ApiError, request } from '#infrastructure/api/request'
import { mapIssueAttributes } from '#layers/workspace/app/sections/issues/shared/api/issueAttributes'
import { createCreateIssueFormDeps } from '#layers/workspace/app/sections/issues/shared/components/CreateIssueForm/CreateIssueForm.deps.impl'
import type { ReadOrganizationCatalog } from '#layers/workspace/app/shells/organization/AppLayout.deps'

import type { CreateBacklogIssuePageDeps } from './CreateBacklogIssuePage.deps'

export const createCreateBacklogIssuePageDeps = (
  client: ApiClient,
  readCatalog: ReadOrganizationCatalog,
): CreateBacklogIssuePageDeps => ({
  form: createCreateIssueFormDeps(client),

  view: async ({ signal, spaceKey }) => {
    const { spaces } = readCatalog()
    const boards = await request(
      client.GET('/api/spaces/{key}/epics', { params: { path: { key: spaceKey } }, signal }),
    )
    const space = spaces.find((item) => item.key === spaceKey)
    const backlog = boards.find((board) => board.isDefault)
    if (!space || !backlog) {
      throw new ApiError(404)
    }
    // The form offers only the attributes the backlog uses (BRD-179).
    const [board, attributes] = await Promise.all([
      request(
        client.GET('/api/epics/{id}', { params: { path: { id: Number(backlog.id) } }, signal }),
      ),
      request(
        client.GET('/api/epics/{id}/attributes', { params: { path: { id: backlog.id } }, signal }),
      ),
    ])
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
