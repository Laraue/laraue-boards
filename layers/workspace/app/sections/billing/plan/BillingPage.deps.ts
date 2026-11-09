export type BillingUsageViewModel = {
  limit: number
  remaining: number
  used: number
}

export type BillingPurchasedTokensViewModel = {
  count: number
  // When the purchased tokens that expire first run out, `null` when there are none.
  expireAt: null | string
  // How many of them expire then, not all the purchased ones.
  expiringCount: number
}

export type BillingStorageViewModel = {
  // The plan's storage plus the storage add-on's, in bytes.
  quotaBytes: number
  // Can be above the quota after a paid plan ends: the files stay, new uploads are refused.
  usedBytes: number
}

type BillingPageCommonData = {
  // Only the organization's owner pays for it.
  canPay: boolean
  issuesPerMonth: BillingUsageViewModel | null
  // When the count of the issues starts over, `null` when there is no issue limit.
  issuesResetAt: null | string
  // When the current period of the plan ends, `null` when it has no end.
  periodEndsAt: null | string
  // Whether the allowance starts over then (a Free plan) or the plan ends (a paid one).
  periodResets: boolean
  // Tokens bought in packs, on top of the plan and spent after its own.
  purchasedTokens: BillingPurchasedTokensViewModel
  // The organization's file storage.
  storage: BillingStorageViewModel
  subscriptionCode: string
  // The tokens of the plan itself: what is left of it and how much of it has been used.
  tokens: BillingUsageViewModel
}

export type BillingPageData =
  | (BillingPageCommonData & {
      freeTeamOrganizations: BillingUsageViewModel | null
      kind: 'personal'
    })
  | (BillingPageCommonData & {
      kind: 'team'
    })

export type BillingPageDeps = {
  view: (input: { signal?: AbortSignal }) => Promise<BillingPageData>
}
