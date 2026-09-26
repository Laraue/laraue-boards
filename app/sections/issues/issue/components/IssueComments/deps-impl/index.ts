import type { ApiClient } from '#infrastructure/api/client'

import type { IssueCommentsDeps } from '../IssueComments.deps'
import { createCreateComment } from './createComment'
import { createDeleteComment } from './deleteComment'
import { createLoadComments } from './loadComments'
import { createUpdateComment } from './updateComment'

export const createIssueCommentsDeps = (
  client: ApiClient,
  summarizeContent: IssueCommentsDeps['summarizeContent'],
): IssueCommentsDeps => ({
  create: createCreateComment(client),
  delete: createDeleteComment(client),
  load: createLoadComments(client),
  summarizeContent,
  update: createUpdateComment(client),
})
