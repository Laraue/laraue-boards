import type { BoardsMovementSectionDeps } from './components/BoardsMovementSection/BoardsMovementSection.deps'
import type { SpacesMovementSectionDeps } from './components/SpacesMovementSection/SpacesMovementSection.deps'

export type DataMovementPageData = {
  currentOrganizationId: string
  currentOrganizationName: string
  spaces: Array<{
    boards: Array<{ color: string; id: string; name: string }>
    color: string
    isDefault: boolean
    key: string
    name: string
  }>
}

export type DataMovementPageDeps = {
  boardsMovementSection: BoardsMovementSectionDeps
  spacesMovementSection: SpacesMovementSectionDeps
  // Rejects with a 403 when the user may not move data in this organization.
  view: (input: { signal?: AbortSignal }) => Promise<DataMovementPageData>
}
