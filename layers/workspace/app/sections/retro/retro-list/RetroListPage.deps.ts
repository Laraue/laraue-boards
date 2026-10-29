export type RetroListItemViewModel = {
  canManage: boolean
  cardCount: number
  createdAt: string
  finished: boolean
  id: string
  name: string
  openActionCount: number
}

export type RetroListPageData = {
  canCreate: boolean
  hasNextPage: boolean
  retros: RetroListItemViewModel[]
}

export type RetroListPageDeps = {
  removeRetro: (input: { retroId: string }) => Promise<void>
  // Resolves with the id of the new retro.
  startRetro: (input: { basedOnRetroId: null | string; name: string }) => Promise<string>
  view: (input: { page: number; signal?: AbortSignal }) => Promise<RetroListPageData>
}
