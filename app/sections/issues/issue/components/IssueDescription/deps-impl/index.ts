import type { ApiClient } from '#infrastructure/api/client'
import { createSummarizeContent } from '~/sections/issues/deps-impl/summarizeContent'

import type { IssueDescriptionDeps } from '../IssueDescription.deps'

export const createIssueDescriptionDeps = (client: ApiClient): IssueDescriptionDeps => ({
  summarizeContent: createSummarizeContent(client),
})
