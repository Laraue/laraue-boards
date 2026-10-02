import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { request } from '#infrastructure/api/request'
import { diffLines } from '~/components/history-timeline/diffLines'
import type {
  HistoryChangeViewModel,
  HistoryPageViewModel,
} from '~/components/history-timeline/HistoryTimeline.types'

import type { OrganizationHistoryPageDeps } from './OrganizationHistoryPage.deps'

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
    case 'title':
      return {
        kind: 'title',
        newColor: null,
        newValue: change.newTitle,
        oldColor: null,
        oldValue: change.oldTitle,
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

const mapHistoryPage = (
  result: Schemas['ShortPaginatedResultOfOrganizationHistoryItem'],
  baseUrl: string,
): HistoryPageViewModel => ({
  hasNextPage: result.hasNextPage,
  items: result.data.flatMap((item) => {
    const changes = item.changes
      .map((change) => mapChange(change, item.action, item.entityType, baseUrl))
      .filter((change) => {
        if (
          change.kind === 'attachment' ||
          change.kind === 'description' ||
          change.kind === 'event'
        ) {
          return true
        }
        return change.oldValue !== change.newValue
      })

    if (item.changes.length && !changes.length) {
      return []
    }

    return {
      changes: changes.length
        ? changes
        : [{ action: item.action, entityType: item.entityType, kind: 'event' as const }],
      createdAt: item.createdAt,
      ...(item.issueKey ? { issueKey: item.issueKey } : {}),
      ...(item.issueTitle ? { issueTitle: item.issueTitle } : {}),
      owner: {
        ...(item.apiKeyName ? { apiKeyName: item.apiKeyName } : {}),
        color: item.owner.color,
        initials: item.owner.initials,
        name: item.owner.displayName,
      },
    }
  }),
})

const PER_PAGE = 20

export const createOrganizationHistoryPageDeps = (
  client: ApiClient,
): OrganizationHistoryPageDeps => ({
  loadInitial: async ({ dateFrom, dateTo, ownerId, signal }) => {
    const [members, history] = await Promise.all([
      request(client.GET('/api/organizations/members', { signal })),
      request(
        client.POST('/api/organizations/history', {
          body: { dateFrom, dateTo, ownerId, pagination: { page: 0, perPage: PER_PAGE } },
          signal,
        }),
      ),
    ])
    return {
      history: mapHistoryPage(history, client.baseUrl),
      users: members
        .map((member) => ({ label: member.displayName, value: member.userId }))
        .toSorted((a, b) => a.label.localeCompare(b.label)),
    }
  },

  loadPage: async ({ dateFrom, dateTo, ownerId, page, signal }) =>
    mapHistoryPage(
      await request(
        client.POST('/api/organizations/history', {
          body: { dateFrom, dateTo, ownerId, pagination: { page, perPage: PER_PAGE } },
          signal,
        }),
      ),
      client.baseUrl,
    ),
})
