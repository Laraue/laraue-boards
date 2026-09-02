export type RetroListPageData = {
  hasNextPage: boolean
  retros: RetroListItemViewModel[]
}

export type RetroListItemViewModel = {
  cardCount: number
  createdAt: string
  finished: boolean
  id: string
  name: string
  openActionCount: number
}
