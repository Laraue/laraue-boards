import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { ApiError, isApiError, request } from '#infrastructure/api/request'
import { createAssigneeSelectDeps } from '~/components/assignee-select/AssigneeSelect.deps.impl'
import { createBoardSelectDeps } from '~/components/board-select/BoardSelect.deps.impl'
import { createSpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps.impl'
import { createStatusSelectDeps } from '~/components/status-select/StatusSelect.deps.impl'
import { DEFAULT_COLOR } from '~/constants/colors'
import { mapIssueAttributeValues } from '~/sections/issues/shared/api/issueAttributes'
import { toLocalIssueDateTime } from '~/sections/issues/shared/api/issueDateTime'
import { updateIssueFormData } from '~/sections/issues/shared/api/issueFormData'
import { assertNever } from '~/utils/assertNever'

import { createIssueCommentsDeps } from './components/IssueComments/IssueComments.deps.impl'
import { createIssueDescriptionDeps } from './components/IssueDescription/IssueDescription.deps.impl'
import { createIssueHistoryDeps } from './components/IssueHistory/IssueHistory.deps.impl'
import type { IssuePageDeps, IssuePageViewModel } from './IssuePage.deps'

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
  boardIsBacklog: boolean,
): IssuePageViewModel => ({
  assignee: issue.assignee.displayName,
  assigneeColor: issue.assignee.color,
  assigneeId: issue.assigneeId,
  assigneeInitial: issue.assignee.initials,
  assigneeIsCurrentUser: issue.assignee.isCurrentUser,
  attachments: mapAttachments(issue.attachments, baseUrl),
  attributes: issue.attributeValues.map(mapAttribute),
  boardColor: issue.epicColor ?? DEFAULT_COLOR,
  boardId: String(issue.epicId),
  boardIsBacklog,
  boardLabel: issue.epicName ?? '',
  canEdit: issue.canEdit,
  content: issue.content ?? '',
  createdAt: issue.time,
  issueKey: issue.key,
  owner: issue.owner.displayName,
  ownerColor: issue.owner.color,
  ownerInitial: issue.owner.initials,
  spaceColor: issue.spaceColor,
  spaceId: issue.spaceKey,
  spaceLabel: issue.spaceName,
  statusId: String(issue.statusId),
  statusLabel: issue.statusName ?? '',
  title: issue.title,
  updatedAt: issue.updatedAt,
})

export const createIssuePageDeps = (client: ApiClient): IssuePageDeps => ({
  assigneeSelect: createAssigneeSelectDeps(client),
  boardSelect: createBoardSelectDeps(client),
  comments: createIssueCommentsDeps(client),

  deleteIssue: async ({ issueKey }) => {
    await request(client.DELETE('/api/issues/{key}', { params: { path: { key: issueKey } } }))
  },

  description: createIssueDescriptionDeps(client),
  history: createIssueHistoryDeps(client),

  // Saving and moving to another status are two requests: when only the move fails, the
  // save still stands and the issue stays where it was.
  saveIssue: async (input) => {
    await request(
      client.PUT('/api/issues/{key}', {
        body: {},
        bodySerializer: () =>
          updateIssueFormData({
            ...input,
            attributeValues: mapIssueAttributeValues(input.attributeValues),
          }),
        params: { path: { key: input.issueKey } },
      }),
    )
    const saved = {
      boardId: input.boardId,
      complete: true,
      content: input.content,
      issueKey: input.issueKey,
      previousBoardId: input.previousBoardId,
      previousIssueKey: input.issueKey,
      previousStatusId: input.previousStatusId,
      spaceKey: input.previousSpaceKey,
      statusId: input.statusId,
      title: input.title,
    }
    if (input.statusId === input.previousStatusId) {
      return saved
    }
    let movedKeys: Record<string, string>
    try {
      movedKeys = await request(
        client.POST('/api/issues/status', {
          body: { issueKeys: [input.issueKey], statusId: Number(input.statusId) },
        }),
      )
    } catch (error) {
      if (!isApiError(error)) {
        throw error
      }
      return {
        ...saved,
        boardId: input.previousBoardId,
        complete: false,
        statusId: input.previousStatusId,
      }
    }
    // Moving to another space gives the issue a new key.
    const issueKey = movedKeys[input.issueKey]
    if (!issueKey) {
      throw new ApiError(0)
    }
    return { ...saved, issueKey, spaceKey: input.spaceKey }
  },

  spaceSelect: createSpaceSelectDeps(client),
  statusSelect: createStatusSelectDeps(client),

  view: async ({ issueKey, signal }) => {
    const issue = await request(
      client.GET('/api/issues/{key}', { params: { path: { key: issueKey } }, signal }),
    )
    // ponytail: a second round trip only to tell the backlog from a board for the path; an
    // epicIsDefault on IssueDetailDto would make it one.
    const boards = await request(
      client.GET('/api/spaces/{key}/epics', { params: { path: { key: issue.spaceKey } }, signal }),
    )
    const board = boards.find((item) => String(item.id) === String(issue.epicId))
    return mapIssue(issue, client.baseUrl, board?.isDefault ?? false)
  },
})
