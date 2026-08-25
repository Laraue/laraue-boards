import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { LoadAssignees } from '../AssigneeSelect.deps'

export const createLoadAssignees =
  (client: ApiClient): LoadAssignees =>
  ({ signal, spaceKey }) =>
    executeQuery({
      map: (members) =>
        members?.map((member) => ({
          color: member.color,
          initials: member.initials,
          isCurrentUser: member.isCurrentUser,
          label: member.displayName,
          value: member.userId,
        })),
      request: () =>
        client.GET('/api/organizations/members', {
          params: { query: { spaceKey } },
          signal,
        }),
    })
