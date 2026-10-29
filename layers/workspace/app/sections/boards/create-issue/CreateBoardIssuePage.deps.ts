import type { CreateIssueFormDeps } from '#layers/workspace/app/sections/issues/shared/components/CreateIssueForm/CreateIssueForm.deps'
import type { IssueAttributeField } from '#layers/workspace/app/sections/issues/shared/components/IssueAttributeFields/IssueAttributeFields.types'

export type CreateBoardIssuePageData = {
  attributes: IssueAttributeField[]
  boardColor: string
  boardName: string
  // The key when the space isn't among the user's spaces.
  spaceColor: string
  spaceName: string
}

export type CreateBoardIssuePageDeps = {
  form: CreateIssueFormDeps
  // Rejects with a 403 when the user cannot create issues on the board.
  view: (input: {
    boardId: string
    signal?: AbortSignal
    spaceKey: string
  }) => Promise<CreateBoardIssuePageData>
}
