import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'

import type { IssueCommentViewModel } from './IssueComments.types'

export type SummarizeContent = (input: { content: string }) => Promise<ActionResult<string>>

export type CreateComment = (input: {
  issueKey: string
  text: string
}) => Promise<ActionResult<true>>

export type DeleteComment = (input: { id: string }) => Promise<ActionResult<true>>

export type LoadComments = (input: {
  issueKey: string
  signal?: AbortSignal
}) => Promise<QueryResult<IssueCommentViewModel[]>>

export type UpdateComment = (input: { id: string; text: string }) => Promise<ActionResult<true>>

export type IssueCommentsDeps = {
  create: CreateComment
  delete: DeleteComment
  load: LoadComments
  summarizeContent: SummarizeContent
  update: UpdateComment
}
