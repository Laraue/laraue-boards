export type TransactionReason = 'DailyGrant' | 'Expiry' | 'Purchase' | 'Spend' | 'TariffGrant'

export type TransactionStatus = 'Canceled' | 'Confirmed' | 'Started'

export type TransactionViewModel = {
  createdAt: string
  delta: number
  error: null | string
  finishedAt: null | string
  id: string
  ownerName: null | string
  reason: TransactionReason
  status: TransactionStatus
}

export type UserTransactionsPageData = {
  hasNextPage: boolean
  transactions: TransactionViewModel[]
}
