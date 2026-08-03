import type { ApiClient } from '#infrastructure/api/client'

import type { IssueHistoryDeps } from '../IssueHistory.deps'
import { createLoadIssueHistory } from './loadIssueHistory'

export const createIssueHistoryDeps = (client: ApiClient): IssueHistoryDeps => ({
  load: createLoadIssueHistory(client),
})
