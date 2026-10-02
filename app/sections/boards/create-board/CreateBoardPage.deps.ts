import type { StatusCategory } from '~/components/status-category-select/StatusCategorySelect.types'

type BoardStatus = { category: StatusCategory; color: string; name: string }

export type CreateBoardInput = {
  color: string
  name: string
  spaceKey: string
  statuses?: BoardStatus[]
}

export type CreateBoardPageData = {
  boards: Array<{ label: string; statuses: BoardStatus[]; value: string }>
}

export type CreateBoardPageDeps = {
  // Resolves with the id the backend gave the board.
  create: (input: CreateBoardInput) => Promise<string>
  view: (input: { signal?: AbortSignal; spaceKey: string }) => Promise<CreateBoardPageData>
}
