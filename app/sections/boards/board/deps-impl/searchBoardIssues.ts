import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import { mapIssueFilters } from '~/sections/issues/shared/api/issueAttributes'
import { createdAtDescending } from '~/sections/issues/shared/api/issueSorting'

import type { BoardPageDeps } from '../BoardPage.deps'
import { mapBoardIssues } from './mapBoardPage'

export const createSearchBoardIssues =
  (client: ApiClient): BoardPageDeps['searchBoardIssues'] =>
  async ({ boardId, filters, search, take }) => {
    return executeQuery({
      map: mapBoardIssues,
      request: () =>
        client.POST('/api/issues/board', {
          body: {
            epicId: boardId,
            filters: mapIssueFilters(filters),
            searchString: search || undefined,
            sorting: createdAtDescending,
            take,
          },
        }),
    })
  }
