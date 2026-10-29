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

export type OrganizationTransactionsPageData = {
  hasNextPage: boolean
  members: Array<{ id: string; name: string }>
  transactions: TransactionViewModel[]
}

export type OrganizationTransactionsPageDeps = {
  view: (input: {
    page: number
    signal?: AbortSignal
    userId?: string
  }) => Promise<OrganizationTransactionsPageData>
}
