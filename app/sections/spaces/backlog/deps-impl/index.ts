import type { ApiClient } from '#infrastructure/api/client'
import { createIssueListDeps } from '~/components/issue-list/deps-impl'

import type { BacklogPageDeps } from '../BacklogPage.deps'
import { createSearchBacklog } from './searchBacklog'
import { createViewBacklog } from './viewBacklog'

export const createBacklogPageDeps = (client: ApiClient): BacklogPageDeps => ({
  issueList: createIssueListDeps(client),
  search: createSearchBacklog(client),
  view: createViewBacklog(client),
})
