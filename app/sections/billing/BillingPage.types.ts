export type BillingUsageViewModel = {
  limit: number
  remaining: number
  used: number
}

export type BillingPageData = {
  freeTeamOrganizations: BillingUsageViewModel | null
  issuesPerMonth: BillingUsageViewModel | null
  kind: 'personal' | 'team'
  subscriptionCode: string
  tokens: BillingUsageViewModel
}
