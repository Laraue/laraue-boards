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

// A paid plan that can be bought.
export type BillingPlanViewModel = {
  currencyCode: string
  formattedPrice: string
  id: string
  issuesPerMonth?: number
  title: string
  tokens: number
}

export type BillingPlansViewModel = {
  personal: BillingPlanViewModel[]
  team: BillingPlanViewModel[]
}

export type BillingPageDeps = {
  getPlans: (input: { signal?: AbortSignal }) => Promise<BillingPlansViewModel>
  // Creates a payment and returns the address to send the customer to.
  startCheckout: (input: { currencyCode: string; planId: string }) => Promise<{ url: string }>
  view: (input: { signal?: AbortSignal }) => Promise<BillingPageData>
}
