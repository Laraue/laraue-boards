import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { AssigneeSelectDeps } from './AssigneeSelect.deps'

export const createAssigneeSelectDeps = (client: ApiClient): AssigneeSelectDeps => ({
  loadAssignees: async ({ signal, spaceKey }) => {
    const members = await request(
      client.GET('/api/organizations/members', { params: { query: { spaceKey } }, signal }),
    )
    return members.map((member) => ({
      color: member.color,
      initials: member.initials,
      isCurrentUser: member.isCurrentUser,
      label: member.displayName,
      value: member.userId,
    }))
  },
})
