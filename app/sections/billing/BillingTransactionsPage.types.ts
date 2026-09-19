import type { components } from '#infrastructure/api/generated'

export type BillingTransactionReason = components['schemas']['TokenTransactionReason']
export type BillingTransactionStatus = components['schemas']['TokenTransactionStatus']

export type BillingTransactionViewModel = {
  createdAt: string
  delta: number
  error: null | string
  finishedAt: null | string
  id: string
  ownerName: null | string
  reason: BillingTransactionReason
  status: BillingTransactionStatus
}

export type BillingTransactionsPageData = {
  hasNextPage: boolean
  members: Array<{ id: string; name: string }>
  transactions: BillingTransactionViewModel[]
}
