import type { components } from '#infrastructure/api/generated'

import type { IssueCommentViewModel } from '../IssueComments.types'

type Schemas = components['schemas']

export const mapIssueComment = (comment: Schemas['CommentDto']): IssueCommentViewModel => ({
  canModify: comment.canModify ?? false,
  createdAt: comment.createdAt ?? '',
  id: String(comment.id),
  owner: {
    color: comment.owner.color,
    initials: comment.owner.initials,
    name: comment.owner.displayName,
  },
  text: comment.text,
  updatedAt: comment.updatedAt ?? comment.createdAt ?? '',
})
