import type { AgentRunState } from '~/components/agent-run-badge/AgentRunBadge.types'

export type IssueAgentRunViewModel = {
  // Why a failed run gave up, as the runner reported it.
  failureReason: null | string
  id: string
  state: AgentRunState
}

export type IssueAgentRunDeps = {
  cancel: (input: { runId: string }) => Promise<void>
  // Creates a run the user's agent runner picks up.
  handOff: (input: { issueKey: string }) => Promise<void>
}
