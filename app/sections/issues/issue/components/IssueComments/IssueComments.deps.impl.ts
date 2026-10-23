import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { request } from '#infrastructure/api/request'
import { mapIssueAttachments } from '~/sections/issues/shared/api/issueAttachments'

import type { IssueCommentsDeps, IssueCommentViewModel } from './IssueComments.deps'

const mapComment = (
  comment: components['schemas']['CommentDto'],
  baseUrl: string,
): IssueCommentViewModel => ({
  attachments: mapIssueAttachments(comment.attachments, baseUrl),
  canModify: comment.canModify ?? false,
  createdAt: comment.createdAt ?? '',
  id: String(comment.id),
  owner: {
    ...(comment.apiKeyName ? { apiKeyName: comment.apiKeyName } : {}),
    color: comment.owner.color,
    initials: comment.owner.initials,
    name: comment.owner.displayName,
  },
  text: comment.text,
  updatedAt: comment.updatedAt ?? comment.createdAt ?? '',
})

// Comments are sent as forms, the way the backend takes them with attachments.
const formOf = (fields: Record<string, string | string[] | File[]>) => {
  const body = new FormData()
  for (const [name, value] of Object.entries(fields)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      body.append(name, item)
    }
  }
  return body
}

export const createIssueCommentsDeps = (client: ApiClient): IssueCommentsDeps => ({
  create: async ({ files, issueKey, text }) => {
    const body = formOf({ Files: files, IssueKey: issueKey, Text: text })
    await request(client.POST('/api/issues/comments', { body: {}, bodySerializer: () => body }))
  },

  delete: async ({ id }) => {
    await request(
      client.DELETE('/api/issues/comments/{id}', { params: { path: { id: Number(id) } } }),
    )
  },

  load: async ({ issueKey, signal }) => {
    const comments = await request(
      client.POST('/api/issues/{key}/comments', {
        body: { pagination: { page: 0, perPage: 100 } },
        params: { path: { key: issueKey } },
        signal,
      }),
    )
    return comments.data.map((comment) => mapComment(comment, client.baseUrl))
  },

  summarizeContent: async ({ content }) =>
    (await request(client.POST('/api/issues/summarize', { body: { content } }))).content,

  update: async ({ files, id, removeAttachmentIds, text }) => {
    const body = formOf({ AddFiles: files, RemoveAttachmentIds: removeAttachmentIds, Text: text })
    await request(
      client.PUT('/api/issues/comments/{id}', {
        body: {},
        bodySerializer: () => body,
        params: { path: { id: Number(id) } },
      }),
    )
  },
})
