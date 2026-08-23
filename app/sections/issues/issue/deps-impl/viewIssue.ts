import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'
import { toLocalIssueDateTime } from '~/sections/issues/shared/api/issueDateTime'
import { assertNever } from '~/utils/assertNever'

import { createLoadComments } from '../components/IssueComments/deps-impl/loadComments'
import type { ViewIssue } from '../IssuePage.deps'
import type { IssuePageViewModel } from '../IssuePage.types'

type Schemas = components['schemas']
const mapAttribute = (
  attribute: Schemas['DetailIssueAttributeDto'],
): IssuePageViewModel['attributes'][number] => {
  const base = {
    color: attribute.color,
    id: String(attribute.id),
    name: attribute.name,
    value: String(attribute.value),
  }
  switch (attribute.type) {
    case 'Text':
      return { ...base, type: 'text' }
    case 'List':
      return {
        ...base,
        options: attribute.listValues.map((option) => ({
          label: option.name,
          value: String(option.id),
        })),
        type: 'list',
      }
    case 'Integer':
      return { ...base, type: 'integer' }
    case 'Decimal':
      return { ...base, type: 'decimal' }
    case 'Date':
      return { ...base, type: 'date' }
    case 'DateTime':
      return { ...base, type: 'dateTime', value: toLocalIssueDateTime(attribute.value) }
    default:
      return assertNever(attribute.type)
  }
}
const mapAttachments = (
  attachments: Schemas['AttachmentData'][],
  baseUrl: string,
): IssuePageViewModel['attachments'] =>
  attachments.flatMap((attachment) => {
    if (attachment.type !== 'Image') {
      return []
    }
    const originalId = attachment.originalFileId
    const previewId = attachment.previewFileId ?? originalId
    if (!previewId) {
      return []
    }
    const fileUrl = (id: string) => new URL(`/api/files/${encodeURIComponent(id)}`, baseUrl).href
    return [{ id: attachment.id, originalUrl: fileUrl(originalId), previewUrl: fileUrl(previewId) }]
  })

const mapIssue = (
  issue: Schemas['IssueDetailDto'],
  baseUrl: string,
): Omit<IssuePageViewModel, 'comments'> => ({
  assignee: issue.assignee.displayName,
  assigneeColor: issue.assignee.color,
  assigneeId: issue.assigneeId,
  assigneeInitial: issue.assignee.initials,
  assigneeIsCurrentUser: issue.assignee.isCurrentUser,
  attachments: mapAttachments(issue.attachments, baseUrl),
  attributes: issue.attributeValues.map(mapAttribute),
  boardId: String(issue.epicId),
  boardLabel: issue.epicName ?? '',
  canEdit: issue.canEdit,
  content: issue.content ?? '',
  createdAt: issue.time,
  issueKey: issue.key,
  owner: issue.owner.displayName,
  ownerColor: issue.owner.color,
  ownerInitial: issue.owner.initials,
  spaceId: issue.spaceKey,
  spaceLabel: issue.spaceName,
  statusId: String(issue.statusId),
  statusLabel: issue.statusName ?? '',
  updatedAt: issue.updatedAt,
})
export const createViewIssue =
  (client: ApiClient): ViewIssue =>
  async ({ issueKey, signal }) => {
    const [issue, comments] = await Promise.all([
      executeQuery({
        map: (response) =>
          response === undefined ? undefined : mapIssue(response, client.baseUrl),
        request: () =>
          client.GET('/api/issues/{key}', { params: { path: { key: issueKey } }, signal }),
      }),
      createLoadComments(client)({ issueKey, signal }),
    ])

    if (issue.status !== 'success') {
      return issue
    }
    if (comments.status !== 'success') {
      return comments
    }
    return { data: { ...issue.data, comments: comments.data }, status: 'success' }
  }
