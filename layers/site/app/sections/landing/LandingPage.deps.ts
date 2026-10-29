export type LandingTariff = {
  billing: { duration: number; period: 'forever' | 'month' }
  currencyCode: string
  formattedPrice: string
  // Team organizations a personal plan allows: a number, `null` when it has no limit, `undefined`
  // when the plan has none to show (team plans).
  freeOrganizations?: null | number
  id: string
  issuesPerMonth?: number
  price: number
  title: string
  tokens: number
}

export type LandingTariffs = {
  personal: LandingTariff[]
  team: LandingTariff[]
}

export type LandingPageDeps = {
  getTariffs: () => Promise<LandingTariffs>
}
