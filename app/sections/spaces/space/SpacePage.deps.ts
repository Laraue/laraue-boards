export type SpaceBoardStatus = 'Active' | 'Done' | 'New'

export type SpaceBoardSummary = {
  color: string
  id: string
  issueCount: number
  kind: 'backlog' | 'board'
  name: string
  status: SpaceBoardStatus
  statuses: Array<{ color: string; count: number; name: string }>
}

export type SpacePageData = {
  boards: SpaceBoardSummary[]
  canCreateBoards: boolean
  canManage: boolean
  color: string
  name: string
}

export type SpacePageDeps = {
  view: (input: { signal?: AbortSignal; spaceKey: string }) => Promise<SpacePageData>
}
