import type { ApiClient } from '#infrastructure/api/client'
import { isApiError, request } from '#infrastructure/api/request'
import { toApiIssueLinkRelation } from '~/sections/issues/shared/api/issueLinks'

import type { IssueLinksDeps } from './IssueLinks.deps'

export const createIssueLinksDeps = (client: ApiClient): IssueLinksDeps => ({
  add: async ({ issueKey, otherIssueKey, relation }) => {
    try {
      await request(
        client.POST('/api/issues/{key}/links', {
          body: { otherIssueKey, relation: toApiIssueLinkRelation(relation) },
          params: { path: { key: issueKey } },
        }),
      )
    } catch (error) {
      // A mistyped key is the user's to fix in the form, not a failure to report.
      if (isApiError(error, 404)) {
        return { outcome: 'notFound' }
      }
      throw error
    }
    return { outcome: 'added' }
  },

  remove: async ({ issueKey, otherIssueKey }) => {
    await request(
      client.DELETE('/api/issues/{key}/links/{otherKey}', {
        params: { path: { key: issueKey, otherKey: otherIssueKey } },
      }),
    )
  },
})
