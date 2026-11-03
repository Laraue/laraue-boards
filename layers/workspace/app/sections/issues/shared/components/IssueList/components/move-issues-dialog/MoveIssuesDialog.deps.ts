import type { BoardSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/BoardSelect/BoardSelect.deps'
import type { StatusSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusSelect.deps'
import type { SpaceSelectDeps } from '#layers/workspace/app/sections/spaces/shared/components/SpaceSelect/SpaceSelect.deps'

export type MoveIssuesDialogDeps = {
  boardSelect: BoardSelectDeps
  moveIssues: (input: {
    // Whether issues landing on another board lose their values of attributes it doesn't use.
    dropUnusedAttributeValues: boolean
    issueKeys: string[]
    statusId: string
  }) => Promise<void>
  spaceSelect: SpaceSelectDeps
  statusSelect: StatusSelectDeps
  // The names of the attributes the issues have values for that the status's board doesn't use.
  unusedAttributes: (input: { issueKeys: string[]; statusId: string }) => Promise<string[]>
}
