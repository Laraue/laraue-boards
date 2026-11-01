import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { request } from '#infrastructure/api/request'
import { mapIssueAttachments } from '#layers/workspace/app/sections/issues/shared/api/issueAttachments'

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
    ...(comment.agent ? { agent: comment.agent } : {}),
    ...(comment.apiKeyName ? { apiKeyName: comment.apiKeyName } : {}),
    color: comment.owner.color,
    initials: comment.owner.initials,
    name: comment.owner.displayName,
  },
  text: comment.text,
  updatedAt: comment.updatedAt ?? comment.createdAt ?? '',
})

// Comments are sent as forms, the way the backend takes them with attachments.
const formOf = (fields: Record<string, string>) => {
  const body = new FormData()
  for (const [name, value] of Object.entries(fields)) {
    body.set(name, value)
  }
  return body
}

const loadComments = async (client: ApiClient, issueKey: string, signal?: AbortSignal) => {
  const comments = await request(
    client.POST('/api/issues/{key}/comments', {
      body: { pagination: { page: 0, perPage: 100 } },
      params: { path: { key: issueKey } },
      signal,
    }),
  )
  return comments.data.map((comment) => mapComment(comment, client.baseUrl))
}

export const createIssueCommentsDeps = (
  client: ApiClient,
): IssueCommentsDeps & { prefetch: (issueKey: string) => void } => {
  // Comments the issue page started loading together with the issue; the comments section mounts
  // only after the issue, so its first load takes this one over instead of asking again. Only the
  // first open of an issue starts one: a later one could outlive a change and show old comments.
  const prefetched = new Map<string, Promise<IssueCommentViewModel[]>>()
  const started = new Set<string>()
  return {
    create: async ({ issueKey, text }) => {
      const body = formOf({ IssueKey: issueKey, Text: text })
      await request(client.POST('/api/issues/comments', { body: {}, bodySerializer: () => body }))
    },

    delete: async ({ id }) => {
      await request(
        client.DELETE('/api/issues/comments/{id}', { params: { path: { id: Number(id) } } }),
      )
    },

    load: ({ issueKey, signal }) => {
      const ahead = prefetched.get(issueKey)
      prefetched.delete(issueKey)
      return ahead ?? loadComments(client, issueKey, signal)
    },

    prefetch: (issueKey) => {
      if (started.has(issueKey)) {
        return
      }
      started.add(issueKey)
      const comments = loadComments(client, issueKey)
      // Read only if the comments section mounts; a failure then shows there.
      comments.catch(() => undefined)
      prefetched.set(issueKey, comments)
    },

    summarizeContent: async ({ content }) =>
      (await request(client.POST('/api/issues/summarize', { body: { content } }))).content,

    update: async ({ id, text }) => {
      const body = formOf({ Text: text })
      await request(
        client.PUT('/api/issues/comments/{id}', {
          body: {},
          bodySerializer: () => body,
          params: { path: { id: Number(id) } },
        }),
      )
    },
  }
}
