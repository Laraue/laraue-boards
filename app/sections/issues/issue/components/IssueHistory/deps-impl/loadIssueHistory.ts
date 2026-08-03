import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'

import type { LoadIssueHistory } from '../IssueHistory.deps'
import type { IssueHistoryChangeViewModel } from '../IssueHistory.types'
import { diffLines } from './diffLines'

type Schemas = components['schemas']
type Change = Schemas['IssueHistoryItemChange']
type Action = Schemas['LogAction']
type EntityType = Schemas['LogEntityType']

const value = (name: null | string) => name ?? 'None'

const actionLabel = (entityType: EntityType, action: Action) =>
  `${entityType} ${action === 'Create' ? 'created' : action === 'Delete' ? 'deleted' : 'updated'}`

const mapChange = (
  change: Change,
  action: Action,
  entityType: EntityType,
): IssueHistoryChangeViewModel => {
  switch (change.$type) {
    case 'content':
      return {
        diff: diffLines(change.oldContent ?? '', change.newContent ?? ''),
        kind: 'description',
        label: entityType === 'Comment' ? actionLabel(entityType, action) : 'Description changed',
      }
    case 'assignee':
      return {
        kind: 'assignee',
        label: 'Assignee changed',
        newColor: change.newAssigneeColor,
        newValue: value(change.newAssigneeDisplayName),
        oldColor: change.oldAssigneeColor,
        oldValue: value(change.oldAssigneeDisplayName),
      }
    case 'status':
      return {
        label: 'Status changed',
        newColor: change.newStatusColor,
        newValue: value(change.newStatusName),
        oldColor: change.oldStatusColor,
        oldValue: value(change.oldStatusName),
      }
    case 'property':
      return {
        label: `${change.propertyName} changed`,
        newColor: change.newValueColor,
        newValue: value(change.newValueName),
        oldColor: change.oldValueColor,
        oldValue: value(change.oldValueName),
      }
    case 'attachment':
      return {
        label: `${
          action === 'Delete' ? 'Removed' : action === 'Create' ? 'Added' : 'Updated'
        } attachment`,
        newValue: change.fileName || 'Untitled file',
      }
    case 'epic':
      return {
        kind: 'board',
        label: 'Board changed',
        newColor: change.newEpicColor,
        newValue: value(change.newEpicName),
        oldColor: change.oldEpicColor,
        oldValue: value(change.oldEpicName),
      }
    case 'space':
      return {
        kind: 'space',
        label: 'Space changed',
        newColor: change.newSpaceColor,
        newValue: value(change.newSpaceName),
        oldColor: change.oldSpaceColor,
        oldValue: value(change.oldSpaceName),
      }
    default:
      return { label: actionLabel(entityType, action) }
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
              items: result.data.map((item) => {
                const changes = item.changes.map((change) =>
                  mapChange(change, item.action, item.entityType),
                )

                return {
                  changes: changes.length
                    ? changes
                    : [{ label: actionLabel(item.entityType, item.action) }],
                  createdAt: item.createdAt,
                  owner: {
                    color: item.owner.color,
                    initials: item.owner.initials,
                    name: item.owner.displayName,
                  },
                }
              }),
            },
      request: () =>
        client.POST('/api/issues/{key}/history', {
          body: { pagination: { page, perPage: 20 } },
          params: { path: { key: issueKey } },
        }),
    })
