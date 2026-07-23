import type { QueryResult } from '#infrastructure/api/apiResult'

import type { AssigneeSelectOption } from './AssigneeSelect.types'

export type LoadAssignees = (input: {
  signal?: AbortSignal
  spaceId: string
}) => Promise<QueryResult<AssigneeSelectOption[]>>

export type AssigneeSelectDeps = {
  loadAssignees: LoadAssignees
}
