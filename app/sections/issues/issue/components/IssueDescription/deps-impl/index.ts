import type { ApiClient } from '#infrastructure/api/client'

import type { IssueDescriptionDeps } from '../IssueDescription.deps'
import { createSummarizeContent } from './summarizeContent'

export const createIssueDescriptionDeps = (client: ApiClient): IssueDescriptionDeps => ({
  summarizeContent: createSummarizeContent(client),
})
