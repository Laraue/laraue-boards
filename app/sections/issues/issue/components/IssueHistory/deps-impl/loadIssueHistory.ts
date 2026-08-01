import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'

import type { LoadIssueHistory } from '../IssueHistory.deps'
import type { IssueHistoryChangeViewModel } from '../IssueHistory.types'
import { diffLines } from './diffLines'

type Schemas = components['schemas']
type Change = Schemas['IssueHistoryItemChange']

const value = (name: null | string, id?: null | number | string) =>
  name ?? (id == null ? 'None' : String(id))

const mapChange = (change: Change): IssueHistoryChangeViewModel => {
  switch (change.$type) {
    case 'content':
      return {
        diff: diffLines(change.oldContent ?? '', change.newContent ?? ''),
        kind: 'description',
        label: 'Description changed',
      }
    case 'assignee':
      return {
        label: 'Assignee changed',
        newValue: value(change.newAssigneeDisplayName, change.newAssigneeId),
        oldValue: value(change.oldAssigneeDisplayName, change.oldAssigneeId),
      }
    case 'status':
      return {
        label: 'Status changed',
        newValue: value(change.newStatusName, change.newStatusId),
        oldValue: value(change.oldStatusName, change.oldStatusId),
      }
    case 'property':
      return {
        label: `${change.propertyName} changed`,
        newValue: value(change.newValueName, change.newValueId),
        oldValue: value(change.oldValueName, change.oldValueId),
      }
    case 'attachment':
      return {
        label: `${
          change.changeAction === 'Delete'
            ? 'Removed'
            : change.changeAction === 'Create'
              ? 'Added'
              : 'Updated'
        } attachment`,
        newValue: change.fileName || 'Untitled file',
      }
    case 'issue':
      return {
        label:
          change.changeAction === 'Create'
            ? 'Issue created'
            : change.changeAction === 'Delete'
              ? 'Issue deleted'
              : 'Issue updated',
      }
    default:
      return { label: 'Issue updated' }
  }
}

export const createLoadIssueHistory =
  (client: ApiClient): LoadIssueHistory =>
  ({ issueKey, page }) =>
    executeQuery({
      map: (result) =>
        result === undefined
          ? undefined
          : {
              hasNextPage: result.hasNextPage,
              items: result.data.map((item) => ({
                changes: item.changes.map(mapChange),
                createdAt: item.createdAt,
                owner: {
                  color: item.owner.color,
                  initials: item.owner.initials,
                  name: item.owner.displayName,
                },
              })),
            },
      request: () =>
        client.POST('/api/issues/{key}/history', {
          body: { pagination: { page, perPage: 20 } },
          params: { path: { key: issueKey } },
        }),
    })
