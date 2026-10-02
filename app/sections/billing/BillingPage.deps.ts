// Every dep resolves with its data or rejects with an `ApiError`.

export type BillingUsageViewModel = {
  limit: number
  remaining: number
  used: number
}

type BillingPageCommonData = {
  issuesPerMonth: BillingUsageViewModel | null
  subscriptionCode: string
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
