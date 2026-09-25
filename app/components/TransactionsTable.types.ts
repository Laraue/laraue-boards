export type TransactionsTableLabels = {
  date: string
  delta: string
  finishedAt: string
  member?: string
  reason: string
  status: string
}

export type TransactionsTableRow = {
  createdAt: string
  createdAtLabel: string
  delta: number
  deltaLabel: string
  error: null | string
  finishedAt: null | string
  finishedAtLabel: null | string
  id: string
  ownerName: null | string
  reason: string
  status: string
  statusClass: string
}
