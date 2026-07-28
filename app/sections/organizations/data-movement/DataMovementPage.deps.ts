import type { QueryResult } from '#infrastructure/api/apiResult'

import type { BoardsMovementSectionDeps } from './components/BoardsMovementSection/BoardsMovementSection.deps'
import type { SpacesMovementSectionDeps } from './components/SpacesMovementSection/SpacesMovementSection.deps'
import type { DataMovementPageData } from './DataMovementPage.types'

export type ViewDataMovement = (input: {
  signal?: AbortSignal
}) => Promise<QueryResult<DataMovementPageData>>

export type DataMovementPageDeps = {
  boardsMovementSection: BoardsMovementSectionDeps
  spacesMovementSection: SpacesMovementSectionDeps
  view: ViewDataMovement
}
