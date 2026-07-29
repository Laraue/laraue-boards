import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import { mapIssueFilters } from '~/sections/issues/shared/api/issueAttributes'

import type { BoardPageDeps } from '../BoardPage.deps'
import { mapIssueListItem } from './mapBoardPage'

export const createLoadMoreBoardIssues =
  (client: ApiClient): BoardPageDeps['loadMoreBoardIssues'] =>
  async ({ filters, offset, search, statusId, take }) => {
    return executeQuery({
      map: (data) =>
        data === undefined
          ? undefined
          : {
              hasNext: data.hasNext ?? false,
              issues: data.data.map(mapIssueListItem),
            },
      request: () =>
        client.POST('/api/issues/by-status/{statusId}/search', {
          body: {
            filters: mapIssueFilters(filters),
            searchString: search || undefined,
            skip: offset,
            take,
          },
          params: { path: { statusId: Number(statusId) } },
        }),
    })
  }
