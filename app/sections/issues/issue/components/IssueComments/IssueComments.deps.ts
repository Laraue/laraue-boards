export type IssueCommentViewModel = {
  canModify: boolean
  createdAt: string
  id: string
  owner: { color: string; initials: string; name: string }
  text: string
  updatedAt: string
}

export type IssueCommentsDeps = {
  create: (input: { issueKey: string; text: string }) => Promise<void>
  delete: (input: { id: string }) => Promise<void>
  load: (input: { issueKey: string; signal?: AbortSignal }) => Promise<IssueCommentViewModel[]>
  // Resolves with the cleaned up text.
  summarizeContent: (input: { content: string }) => Promise<string>
  update: (input: { id: string; text: string }) => Promise<void>
}
