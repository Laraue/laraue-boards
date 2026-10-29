import type { IssueAttachmentViewModel } from '~/components/issue-attachments/IssueAttachments.types'

export type IssueCommentViewModel = {
  attachments: IssueAttachmentViewModel[]
  canModify: boolean
  createdAt: string
  id: string
  // apiKeyName: the API key the comment was written through; absent when written in the app.
  // agent: set when that key was issued to a coding agent - the comment is the agent's, acting for the owner.
  owner: {
    agent?: { clientName: string; machineName: string }
    apiKeyName?: string
    color: string
    initials: string
    name: string
  }
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
