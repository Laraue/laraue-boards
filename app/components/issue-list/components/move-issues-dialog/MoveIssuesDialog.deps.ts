import type { ActionResult } from '#infrastructure/api/apiResult'
import type { BoardSelectDeps } from '~/components/board-select/BoardSelect.deps'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'
import type { StatusSelectDeps } from '~/components/status-select/StatusSelect.deps'

import type { MoveIssuesInput } from './MoveIssuesDialog.types'

export type MoveIssues = (input: MoveIssuesInput) => Promise<ActionResult<true>>

export type MoveIssuesDialogDeps = {
  boardSelect: BoardSelectDeps
  moveIssues: MoveIssues
  spaceSelect: SpaceSelectDeps
  statusSelect: StatusSelectDeps
}
