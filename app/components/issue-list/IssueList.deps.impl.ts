import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { createAssigneeSelectDeps } from '~/components/assignee-select/AssigneeSelect.deps.impl'
import { createStatusSelectDeps } from '~/components/status-select/StatusSelect.deps.impl'

import { createMoveIssuesDialogDeps } from './components/move-issues-dialog/MoveIssuesDialog.deps.impl'
import type { IssueListDeps } from './IssueList.deps'

export const createIssueListDeps = (client: ApiClient): IssueListDeps => ({
  deleteIssue: async ({ issueKey }) => {
    await request(client.DELETE('/api/issues/{key}', { params: { path: { key: issueKey } } }))
  },
  moveIssuesDialog: createMoveIssuesDialogDeps(client),
  quickEdit: {
    assigneeSelect: createAssigneeSelectDeps(client),
    saveAssignee: async ({ assigneeId, issueKey }) => {
      const issue = await request(
        client.GET('/api/issues/{key}', { params: { path: { key: issueKey } } }),
      )
      const attributeTypes = {
        Date: 'date',
        DateTime: 'datetime',
        Decimal: 'decimal',
        Integer: 'integer',
        List: 'enum',
        Text: 'string',
      } as const
      const form = new FormData()
      form.append('Title', issue.title)
      form.append('Content', issue.content ?? '')
      form.append('AssigneeId', assigneeId)
      form.append(
        'AttributeValues',
        JSON.stringify(
          issue.attributeValues
            .filter((attribute) => attribute.value !== '')
            .map((attribute) => ({
              $type: attributeTypes[attribute.type],
              attributeId: attribute.id,
              ...(attribute.type === 'List'
                ? { valueId: attribute.value }
                : { value: attribute.value }),
            })),
        ),
      )
      await request(
        client.PUT('/api/issues/{key}', {
          body: {},
          bodySerializer: () => form,
          params: { path: { key: issueKey } },
        }),
      )
    },
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
