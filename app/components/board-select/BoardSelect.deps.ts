import type { QueryResult } from '#infrastructure/api/apiResult'

import type { BoardSelectOption } from './BoardSelect.types'

export type LoadBoards = (input: {
  signal?: AbortSignal
  spaceId: string
}) => Promise<QueryResult<BoardSelectOption[]>>

export type BoardSelectDeps = {
  loadBoards: LoadBoards
}
