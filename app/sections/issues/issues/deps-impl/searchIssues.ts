import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import { mapIssueFilters } from '~/sections/issues/shared/api/issueAttributes'
import { createdAtDescending } from '~/sections/issues/shared/api/issueSorting'

import type { SearchIssues } from '../IssuesPage.deps'
import { mapIssue } from './mapIssue'

export const createSearchIssues =
  (client: ApiClient): SearchIssues =>
  ({ filters, page, search, spaceIds }) => {
    const mappedFilters = mapIssueFilters(filters)

    return executeQuery({
      map: (data) =>
        data === undefined
          ? undefined
          : { hasNextPage: data.hasNextPage, issues: data.data.map(mapIssue) },
      request: () =>
        client.POST('/api/issues/search', {
          body: {
            filters: mappedFilters,
            page: page - 1,
            perPage: 10,
            searchString: search || undefined,
            sorting: createdAtDescending,
            spaceKeys: spaceIds.length ? spaceIds : undefined,
          },
        }),
    })
  }
