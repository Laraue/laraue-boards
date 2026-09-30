import type { ActionResult } from '#infrastructure/api/apiResult'

export type SummarizedContent = { content: string; title: null | string }

export type SummarizeContent = (input: {
  content: string
}) => Promise<ActionResult<SummarizedContent>>

export type IssueDescriptionDeps = {
  summarizeContent: SummarizeContent
}
