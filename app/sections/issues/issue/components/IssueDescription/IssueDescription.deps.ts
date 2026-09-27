import type { ActionResult } from '#infrastructure/api/apiResult'

export type SummarizeContent = (input: { content: string }) => Promise<ActionResult<string>>

export type IssueDescriptionDeps = {
  summarizeContent: SummarizeContent
}
