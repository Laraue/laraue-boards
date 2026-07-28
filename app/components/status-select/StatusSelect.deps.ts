import type { QueryResult } from '#infrastructure/api/apiResult'

import type { StatusSelectOption } from './StatusSelect.types'

export type LoadStatuses = (input: {
  boardId: string
  signal?: AbortSignal
}) => Promise<QueryResult<StatusSelectOption[]>>

export type StatusSelectDeps = {
  loadStatuses: LoadStatuses
}
