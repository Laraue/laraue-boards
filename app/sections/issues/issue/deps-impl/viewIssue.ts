import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'

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
    value: attribute.value,
  }
  switch (attribute.type) {
    case 0:
      return { ...base, type: 'text' }
    case 1:
      return {
        ...base,
        options: attribute.listValues.map((option) => ({
          label: option.name,
          value: String(option.id),
        })),
        type: 'list',
      }
    default:
      throw new RangeError(`Unsupported attribute type: ${attribute.type}`)
  }
}
const mapAttachments = (
  attachments: Schemas['AttachmentData'][],
  baseUrl: string,
): IssuePageViewModel['attachments'] =>
  attachments.flatMap((attachment) => {
    if (attachment.type !== 0) {
      return []
    }
    const previewId = attachment.previewFileId ?? attachment.originalFileId
    if (!previewId) {
      return []
    }
    const originalId = attachment.originalFileId ?? previewId
    const fileUrl = (id: string) => new URL(`/api/files/${encodeURIComponent(id)}`, baseUrl).href
    return [{ id: attachment.id, originalUrl: fileUrl(originalId), previewUrl: fileUrl(previewId) }]
  })
const mapIssue = (issue: Schemas['IssueDetailDto'], baseUrl: string): IssuePageViewModel => ({
  assignee: issue.assignee,
  assigneeColor: issue.assigneeColor,
  assigneeId: issue.assigneeId,
  assigneeInitial: issue.assigneeInitial,
  attachments: mapAttachments(issue.attachments, baseUrl),
  attributes: issue.attributeValues.map(mapAttribute),
  boardId: String(issue.epicId),
  boardLabel: issue.epicName ?? '',
  canEdit: issue.canEdit,
  content: issue.content ?? '',
  createdAt: issue.time,
  issueKey: issue.key,
  owner: issue.ownerDisplayName ?? 'Unknown owner',
  ownerColor: issue.ownerColor,
  ownerInitial: issue.ownerInitials ?? '?',
  spaceId: String(issue.spaceId),
  spaceLabel: issue.spaceName,
  statusId: String(issue.statusId),
  statusLabel: issue.statusName ?? '',
  updatedAt: issue.updatedAt,
})
export const createViewIssue =
  (client: ApiClient): ViewIssue =>
  ({ issueKey, signal }) =>
    executeQuery({
      map: (issue) => (issue === undefined ? undefined : mapIssue(issue, client.baseUrl)),
      request: () =>
        client.GET('/api/issues/{key}', { params: { path: { key: issueKey } }, signal }),
    })
