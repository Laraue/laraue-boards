import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { SummarizeContent } from '../IssueComments.deps'

export const createSummarizeContent =
  (client: ApiClient): SummarizeContent =>
  ({ content }) =>
    executeAction({
      map: (result) => result,
      request: () =>
        client.POST('/api/issues/summarize', {
          body: { content },
          parseAs: 'text',
        }),
    })
