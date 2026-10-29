import type { components } from '#infrastructure/api/generated'
import type { AgentRunState } from '#layers/workspace/app/sections/issues/shared/components/AgentRunBadge/AgentRunBadge.types'
import { assertNever } from '#layers/workspace/app/shared/utils/assertNever'

export const mapAgentRunState = (state: components['schemas']['AgentRunState']): AgentRunState => {
  switch (state) {
    case 'Ready':
      return 'ready'
    case 'Working':
      return 'working'
    case 'Done':
      return 'done'
    case 'Failed':
      return 'failed'
    case 'Cancelled':
      return 'cancelled'
    default:
      return assertNever(state)
  }
}
