import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { IssueAgentRunDeps } from './IssueAgentRun.deps'

export const createIssueAgentRunDeps = (client: ApiClient): IssueAgentRunDeps => ({
  cancel: async ({ runId }) => {
    await request(
      client.POST('/api/agent-runs/{id}/cancel', { params: { path: { id: Number(runId) } } }),
    )
  },

  handOff: async ({ issueKey }) => {
    await request(client.POST('/api/agent-runs', { body: { issueKey } }))
  },

  sendBack: async ({ comment, issueKey }) => {
    await request(client.POST('/api/agent-runs/send-back', { body: { comment, issueKey } }))
  },
})
