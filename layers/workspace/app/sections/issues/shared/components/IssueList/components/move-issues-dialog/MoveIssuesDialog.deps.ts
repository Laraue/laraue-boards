import type { BoardSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/BoardSelect/BoardSelect.deps'
import type { StatusSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusSelect.deps'
import type { SpaceSelectDeps } from '#layers/workspace/app/sections/spaces/shared/components/SpaceSelect/SpaceSelect.deps'

export type MoveIssuesDialogDeps = {
  boardSelect: BoardSelectDeps
  moveIssues: (input: { issueKeys: string[]; statusId: string }) => Promise<void>
  spaceSelect: SpaceSelectDeps
  statusSelect: StatusSelectDeps
}
