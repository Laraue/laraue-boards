import type { AgentRunState } from '~/components/agent-run-badge/AgentRunBadge.types'
import type { StatusCategory } from '~/components/status-category-select/StatusCategorySelect.types'

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
}
