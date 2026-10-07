export type ChangePlanPageData = {
  canPay: boolean
  kind: 'personal' | 'team'
  subscriptionCode: string
}

export type BillingPlanViewModel = {
  currencyCode: string
  formattedPrice: string
  id: string
  isFree: boolean
  issuesPerMonth?: number
  title: string
  tokens: number
}

export type ChangePlanPageDeps = {
  getPlans: (input: { signal?: AbortSignal }) => Promise<{
    personal: BillingPlanViewModel[]
    team: BillingPlanViewModel[]
  }>
  startCheckout: (input: {
    currencyCode: string
    itemId: string
    kind: 'Subscription'
  }) => Promise<{ url: string }>
  view: (input: { signal?: AbortSignal }) => Promise<ChangePlanPageData>
}
