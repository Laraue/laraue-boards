export type ChangePlanPageData = {
  canPay: boolean
  kind: 'personal' | 'team'
  // The storage add-on the current plan has, `null` for none.
  storageAddonId: null | string
  // What the organization's files take now: a plan can't be bought with less storage than that.
  storageUsedBytes: number
  subscriptionCode: string
}

// A paid plan's price together with one storage add-on, as the checkout charges it.
export type BillingPlanAddonPriceViewModel = {
  addonId: string
  formattedPrice: string
}

export type BillingPlanViewModel = {
  currencyCode: string
  formattedPrice: string
  id: string
  isFree: boolean
  issuesPerMonth?: number
  // Empty for a free plan, which takes no add-on.
  storageAddonPrices: BillingPlanAddonPriceViewModel[]
  storageMegabytes: number
  title: string
  tokens: number
}

// Extra storage bought with a paid plan, with its own monthly price.
export type StorageAddonViewModel = {
  formattedPrice: string
  id: string
  storageMegabytes: number
  title: string
}

export type CheckoutResult =
  | { kind: 'payment'; url: string }
  // The plan and add-on would give less storage than the files already take: nothing was started.
  | { excessBytes: number; kind: 'storageOverLimit'; quotaBytes: number; usedBytes: number }

export type ChangePlanPageDeps = {
  getPlans: (input: { signal?: AbortSignal }) => Promise<{
    personal: BillingPlanViewModel[]
    storageAddons: StorageAddonViewModel[]
    team: BillingPlanViewModel[]
  }>
  startCheckout: (input: {
    currencyCode: string
    itemId: string
    kind: 'Subscription'
    // `null` buys the plan without extra storage, which removes the add-on the plan has.
    storageAddonId: null | string
  }) => Promise<CheckoutResult>
  view: (input: { signal?: AbortSignal }) => Promise<ChangePlanPageData>
}
