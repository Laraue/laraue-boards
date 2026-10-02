import type { BoardSelectDeps } from '~/components/board-select/BoardSelect.deps'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'
import type { StatusSelectDeps } from '~/components/status-select/StatusSelect.deps'

export type MoveIssuesDialogDeps = {
  boardSelect: BoardSelectDeps
  moveIssues: (input: { issueKeys: string[]; statusId: string }) => Promise<void>
  spaceSelect: SpaceSelectDeps
  statusSelect: StatusSelectDeps
}
