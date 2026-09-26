import type { ApiClient } from '#infrastructure/api/client'

import type { IssueCommentsDeps } from '../IssueComments.deps'
import { createCreateComment } from './createComment'
import { createDeleteComment } from './deleteComment'
import { createLoadComments } from './loadComments'
import { createSummarizeContent } from './summarizeContent'
import { createUpdateComment } from './updateComment'

export const createIssueCommentsDeps = (client: ApiClient): IssueCommentsDeps => ({
  create: createCreateComment(client),
  delete: createDeleteComment(client),
  load: createLoadComments(client),
  summarizeContent: createSummarizeContent(client),
  update: createUpdateComment(client),
})
