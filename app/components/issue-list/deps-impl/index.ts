import type { ApiClient } from '#infrastructure/api/client'

import { createMoveIssuesDialogDeps } from '../components/move-issues-dialog/deps-impl'
import type { IssueListDeps } from '../IssueList.deps'

export const createIssueListDeps = (client: ApiClient): IssueListDeps => ({
  moveIssuesDialog: createMoveIssuesDialogDeps(client),
})
