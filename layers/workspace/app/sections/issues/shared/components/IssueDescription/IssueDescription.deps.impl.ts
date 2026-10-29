import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { IssueDescriptionDeps } from './IssueDescription.deps'

export const createIssueDescriptionDeps = (client: ApiClient): IssueDescriptionDeps => ({
  summarizeContent: async ({ content }) => {
    const summary = await request(
      client.POST('/api/issues/summarize', { body: { content, generateTitle: true } }),
    )
    return { content: summary.content, title: summary.title }
  },
})
