export type BillingUsageViewModel = {
  limit: number
  remaining: number
  used: number
}

type BillingPageCommonData = {
  // Only the organization's owner pays for it.
  canPay: boolean
  // The currency every payment is charged in.
  issuesPerMonth: BillingUsageViewModel | null
  paymentCurrencyCode: string
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
  // The price in USD for a plan charged in another currency, for orientation only ("$5").
  referencePrice?: string
  title: string
  tokens: number
}

export type BillingPlansViewModel = {
  personal: BillingPlanViewModel[]
  team: BillingPlanViewModel[]
}

export type BillingPageDeps = {
  getPlans: (input: {
    currencyCode: string
    signal?: AbortSignal
  }) => Promise<BillingPlansViewModel>
  // Creates a payment, in the currency the backend charges in, and returns the address to send the
  // customer to.
  startCheckout: (input: { planId: string }) => Promise<{ url: string }>
  view: (input: { signal?: AbortSignal }) => Promise<BillingPageData>
}
