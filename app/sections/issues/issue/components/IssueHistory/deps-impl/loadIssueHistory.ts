import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'
import { diffLines } from '~/components/history-timeline/diffLines'
import type {
  HistoryChangeViewModel,
  HistoryPageViewModel,
} from '~/components/history-timeline/HistoryTimeline.types'

import type { LoadIssueHistory } from '../IssueHistory.deps'

type Schemas = components['schemas']
type Change = Schemas['HistoryItemChange']
type Action = Schemas['LogAction']
type EntityType = Schemas['LogEntityType']
type AttributeType = Schemas['AttributeType']

const value = (name: null | string) => name ?? 'None'
const formatPropertyValue = (name: null | string, type: AttributeType) => {
  if (name === null || (type !== 'Date' && type !== 'DateTime')) {
    return value(name)
  }

  const date = new Date(name)

  return Number.isNaN(date.getTime())
    ? name
    : new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        ...(type === 'DateTime' ? { timeStyle: 'short' } : {}),
        timeZone: 'UTC',
      }).format(date)
}

const actionLabel = (entityType: EntityType, action: Action) =>
  `${entityType} ${action === 'Create' ? 'created' : action === 'Delete' ? 'deleted' : 'updated'}`

const mapChange = (
  change: Change,
  action: Action,
  entityType: EntityType,
  baseUrl: string,
): HistoryChangeViewModel => {
  switch (change.$type) {
    case 'content':
      return {
        diff: diffLines(change.oldContent ?? '', change.newContent ?? ''),
        kind: 'description',
        label: entityType === 'Comment' ? actionLabel(entityType, action) : 'Description',
      }
    case 'assignee':
      return {
        kind: 'assignee',
        label: 'Assignee',
        newColor: change.newAssigneeColor,
        newValue: value(change.newAssigneeDisplayName),
        oldColor: change.oldAssigneeColor,
        oldValue: value(change.oldAssigneeDisplayName),
      }
    case 'status':
      return {
        kind: 'status',
        label: 'Status',
        newColor: change.newStatusColor,
        newValue: value(change.newStatusName),
        oldColor: change.oldStatusColor,
        oldValue: value(change.oldStatusName),
      }
    case 'property':
      return {
        kind: 'property',
        label: change.propertyName,
        newColor: change.newValueColor,
        newValue: formatPropertyValue(change.newValueName, change.attributeType),
        oldColor: change.oldValueColor,
        oldValue: formatPropertyValue(change.oldValueName, change.attributeType),
      }
    case 'attachment':
      return {
        imageUrl: change.previewFileId
          ? new URL(`/api/files/${encodeURIComponent(change.previewFileId)}`, baseUrl).href
          : null,
        kind: 'attachment',
        label: `${change.action === 'Deleted' ? 'Removed' : 'Added'} attachment`,
        newValue: change.fileName || 'Untitled file',
      }
    case 'epic':
      return {
        kind: 'board',
        label: 'Board',
        newColor: change.newEpicColor,
        newValue: value(change.newEpicName),
        oldColor: change.oldEpicColor,
        oldValue: value(change.oldEpicName),
      }
    case 'space':
      return {
        kind: 'space',
        label: 'Space',
        newColor: change.newSpaceColor,
        newValue: value(change.newSpaceName),
        oldColor: change.oldSpaceColor,
        oldValue: value(change.oldSpaceName),
      }
    default:
      return { kind: 'event', label: actionLabel(entityType, action) }
  }
}

export const mapHistoryPage = (
  result: Schemas['ShortPaginatedResultOfOrganizationHistoryItem'],
  baseUrl: string,
): HistoryPageViewModel => ({
  hasNextPage: result.hasNextPage,
  items: result.data.flatMap((item) => {
    const changes = item.changes
      .map((change) => mapChange(change, item.action, item.entityType, baseUrl))
      .filter((change) => !('oldValue' in change) || change.oldValue !== change.newValue)

    if (item.changes.length && !changes.length) {
      return []
    }

    return {
      changes: changes.length
        ? changes
        : [
            {
              kind: 'event' as const,
              label: actionLabel(item.entityType, item.action),
            },
          ],
      createdAt: item.createdAt,
      ...(item.issueKey ? { issueKey: item.issueKey } : {}),
      owner: {
        color: item.owner.color,
        initials: item.owner.initials,
        name: item.owner.displayName,
      },
    }
  }),
})

export const createLoadIssueHistory =
  (client: ApiClient): LoadIssueHistory =>
  ({ issueKey, page }) =>
    executeQuery({
      map: (result) => result && mapHistoryPage(result, client.baseUrl),
      request: () =>
        client.POST('/api/issues/{key}/history', {
          body: { pagination: { page, perPage: 20 } },
          params: { path: { key: issueKey } },
        }),
    })
