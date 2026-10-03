import type { CreateIssueFormDeps } from '~/components/create-issue-form/CreateIssueForm.deps'
import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'

export type CreateBoardIssuePageData = {
  attributes: IssueAttributeField[]
  boardName: string
  // The key when the space isn't among the user's spaces.
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
