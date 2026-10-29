import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { mapHistoryPage } from '#layers/workspace/app/shared/components/HistoryTimeline/api/mapHistoryPage'

import type { IssueHistoryDeps } from './IssueHistory.deps'

export const createIssueHistoryDeps = (client: ApiClient): IssueHistoryDeps => ({
  load: async ({ issueKey, page }) => {
    const result = await request(
      client.POST('/api/issues/{key}/history', {
        body: { pagination: { page, perPage: 20 } },
        params: { path: { key: issueKey } },
      }),
    )
    return mapHistoryPage(result, client.baseUrl)
  },
})
