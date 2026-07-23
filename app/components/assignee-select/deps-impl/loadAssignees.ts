import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { LoadAssignees } from '../AssigneeSelect.deps'

export const createLoadAssignees =
  (client: ApiClient): LoadAssignees =>
  ({ signal, spaceId }) =>
    executeQuery({
      map: (members) =>
        members?.map((member) => ({
          color: member.color,
          initials: member.initials,
          label: member.displayName,
          value: member.userId,
        })),
      request: () =>
        client.GET('/api/spaces/{id}/members', {
          params: { path: { id: Number(spaceId) } },
          signal,
        }),
    })
