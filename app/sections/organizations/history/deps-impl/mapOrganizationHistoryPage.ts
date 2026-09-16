import type { components } from '#infrastructure/api/generated'
import { diffLines } from '~/components/history-timeline/diffLines'
import type {
  HistoryChangeViewModel,
  HistoryPageViewModel,
} from '~/components/history-timeline/HistoryTimeline.types'

type Schemas = components['schemas']
type Change = Schemas['HistoryItemChange']
type Action = Schemas['LogAction']
type EntityType = Schemas['LogEntityType']
type AttributeType = Schemas['AttributeType']

const propertyFormat = (type: AttributeType) =>
  type === 'Date' ? 'date' : type === 'DateTime' ? 'dateTime' : null

const mapChange = (
  change: Change,
  action: Action,
  entityType: EntityType,
  baseUrl: string,
): HistoryChangeViewModel => {
  switch (change.$type) {
    case 'content':
      return {
        commentAction: entityType === 'Comment' ? action : null,
        diff: diffLines(change.oldContent ?? '', change.newContent ?? ''),
        kind: 'description',
      }
    case 'assignee':
      return {
        kind: 'assignee',
        newColor: change.newAssigneeColor,
        newValue: change.newAssigneeDisplayName,
        oldColor: change.oldAssigneeColor,
        oldValue: change.oldAssigneeDisplayName,
      }
    case 'status':
      return {
        kind: 'status',
        newColor: change.newStatusColor,
        newValue: change.newStatusName,
        oldColor: change.oldStatusColor,
        oldValue: change.oldStatusName,
      }
    case 'property':
      return {
        format: propertyFormat(change.attributeType),
        kind: 'property',
        label: change.propertyName,
        newColor: change.newValueColor,
        newValue: change.newValueName,
        oldColor: change.oldValueColor,
        oldValue: change.oldValueName,
      }
    case 'attachment':
      return {
        action: change.action === 'Deleted' ? 'removed' : 'added',
        fileName: change.fileName || null,
        imageUrl: change.previewFileId
          ? new URL(`/api/files/${encodeURIComponent(change.previewFileId)}`, baseUrl).href
          : null,
        kind: 'attachment',
      }
    case 'epic':
      return {
        kind: 'board',
        newColor: change.newEpicColor,
        newValue: change.newEpicName,
        oldColor: change.oldEpicColor,
        oldValue: change.oldEpicName,
      }
    case 'space':
      return {
        kind: 'space',
        newColor: change.newSpaceColor,
        newValue: change.newSpaceName,
        oldColor: change.oldSpaceColor,
        oldValue: change.oldSpaceName,
      }
    default:
      return { action, entityType, kind: 'event' }
  }
}

export const mapOrganizationHistoryPage = (
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
        : [{ action: item.action, entityType: item.entityType, kind: 'event' as const }],
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
