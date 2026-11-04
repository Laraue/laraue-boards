import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { createStatusSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusSelect.deps.impl'
import { saveIssueAssignee } from '#layers/workspace/app/sections/issues/shared/api/saveIssueAssignee'
import { createAssigneeSelectDeps } from '#layers/workspace/app/sections/issues/shared/components/AssigneeSelect/AssigneeSelect.deps.impl'

import { createMoveIssuesDialogDeps } from './components/move-issues-dialog/MoveIssuesDialog.deps.impl'
import type { IssueListDeps } from './IssueList.deps'

export const createIssueListDeps = (client: ApiClient): IssueListDeps => ({
  deleteIssue: async ({ issueKey }) => {
    await request(client.DELETE('/api/issues/{key}', { params: { path: { key: issueKey } } }))
  },
  moveIssuesDialog: createMoveIssuesDialogDeps(client),
  quickEdit: {
    assigneeSelect: createAssigneeSelectDeps(client),
    saveAssignee: (input) => saveIssueAssignee(client, input),
    saveStatus: async ({ issueKey, statusId }) => {
      await request(
        client.POST('/api/issues/status', {
          body: { issueKeys: [issueKey], statusId: Number(statusId) },
        }),
      )
    },
    statusSelect: createStatusSelectDeps(client),
  },
})
