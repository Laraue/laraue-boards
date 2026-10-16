import type { AgentRunState } from '~/components/agent-run-badge/AgentRunBadge.types'

export type IssueCardViewModel = {
  // The latest agent run's state; absent when the issue was never handed to the agent.
  agentRunState?: AgentRunState
  assigneeColor: string
  assigneeInitial: string
  assigneeName: string
  issueKey: string
  time: string
  title: string
}
