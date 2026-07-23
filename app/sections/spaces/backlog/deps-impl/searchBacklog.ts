import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import { mapIssueFilters } from '~/sections/issues/shared/api/issueAttributes'
import { createdAtDescending } from '~/sections/issues/shared/api/issueSorting'

import type { SearchBacklog } from '../BacklogPage.deps'
import { mapIssue } from './mapIssue'

export const createSearchBacklog =
  (client: ApiClient): SearchBacklog =>
  ({ backlogBoardId, filters, page, search }) =>
    executeQuery({
      map: (data) =>
        data === undefined
          ? undefined
          : { hasNextPage: data.hasNextPage, issues: data.data.map(mapIssue) },
      request: () =>
        client.POST('/api/issues/search', {
          body: {
            epicIds: [backlogBoardId],
            filters: mapIssueFilters(filters),
            page: page - 1,
            perPage: 10,
            searchString: search || undefined,
            sorting: createdAtDescending,
          },
        }),
    })
