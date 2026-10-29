import type { StatusCategory } from '#layers/workspace/app/sections/boards/shared/components/StatusCategorySelect/StatusCategorySelect.types'
import type { AgentRunState } from '#layers/workspace/app/sections/issues/shared/components/AgentRunBadge/AgentRunBadge.types'

// What keeps the user from handing the issue off now, as the backend decided it.
export type AgentHandOffBlocker =
  | 'boardNotReady'
  | 'issueStarted'
  | 'noApiKey'
  | 'notAllowed'
  | 'runOpen'

export type AgentHandOffViewModel = {
  available: boolean
  blocker: AgentHandOffBlocker | null
  // The agent already worked on the issue and it can be sent back to it with a comment.
  canSendBack: boolean
  // For boardNotReady: the stages the board has no status for.
  missingStatusCategories: StatusCategory[]
}

export type IssueAgentRunViewModel = {
  // Why a failed run gave up, as the runner reported it.
  failureReason: null | string
  // When the run was done, failed or cancelled; null while it's open.
  finishedAt: null | string
  id: string
  state: AgentRunState
}

export type IssueAgentRunDeps = {
  cancel: (input: { runId: string }) => Promise<void>
  // Creates a run the user's agent runner picks up.
  handOff: (input: { issueKey: string }) => Promise<void>
  // Posts the comment, moves the issue back to not started and hands it off again - one request.
  sendBack: (input: { comment: string; issueKey: string }) => Promise<void>
}
