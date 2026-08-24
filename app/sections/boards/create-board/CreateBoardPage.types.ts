export type CreateBoardInput = {
  color: string
  name: string
  spaceKey: string
  statuses?: Array<{ color: string; name: string }>
}

export type CreateBoardPageData = {
  boards: Array<{
    label: string
    statuses: Array<{ color: string; name: string }>
    value: string
  }>
}
