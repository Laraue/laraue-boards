export type BillingUsageViewModel = {
  limit: number
  remaining: number
  used: number
}

type BillingPageCommonData = {
  // Only the organization's owner pays for it.
  canPay: boolean
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

// A plan of the plan list; only a paid one can be bought.
export type BillingPlanViewModel = {
  currencyCode: string
  formattedPrice: string
  id: string
  isFree: boolean
  issuesPerMonth?: number
  title: string
  tokens: number
}

export type BillingPlansViewModel = {
  personal: BillingPlanViewModel[]
  team: BillingPlanViewModel[]
}

// A one-off pack of tokens that can be bought on top of the plan.
export type BillingTokenPackViewModel = {
  currencyCode: string
  // How many months the tokens last, `null` when they never expire.
  expirationMonths: null | number
  formattedPrice: string
  id: string
  title: string
  tokens: number
}

// What a payment buys: a plan (a subscription) or a token pack.
export type BillingItemKind = 'Subscription' | 'TokenPack'

export type BillingPageDeps = {
  getPlans: (input: { signal?: AbortSignal }) => Promise<BillingPlansViewModel>
  getTokenPacks: (input: { signal?: AbortSignal }) => Promise<BillingTokenPackViewModel[]>
  // Creates a payment and returns the address to send the customer to.
  startCheckout: (input: {
    currencyCode: string
    itemId: string
    kind: BillingItemKind
  }) => Promise<{ url: string }>
  view: (input: { signal?: AbortSignal }) => Promise<BillingPageData>
}
