export type RetroListPageData = {
  canCreate: boolean
  hasNextPage: boolean
  retros: RetroListItemViewModel[]
}

export type RetroListItemViewModel = {
  canManage: boolean
  cardCount: number
  createdAt: string
  finished: boolean
  id: string
  name: string
  openActionCount: number
}
