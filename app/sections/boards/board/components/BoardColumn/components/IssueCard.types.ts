import type { AgentRunState } from '~/components/agent-run-badge/AgentRunBadge.types'
import type { IssueSource } from '~/components/issue-source-icon/IssueSourceIcon.types'

export type IssueCardViewModel = {
  // The latest agent run's state; absent when the issue was never handed to the agent.
  agentRunState?: AgentRunState
  assigneeColor: string
  assigneeInitial: string
  assigneeName: string
  // An issue the user can read blocks this one and isn't completed yet.
  blocked: boolean
  issueKey: string
  // How the issue was created; absent when the API sends none.
  source?: IssueSource
  time: string
  title: string
}
