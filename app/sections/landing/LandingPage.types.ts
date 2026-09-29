export type LandingCurrency = 'RUB' | 'USD'

export type LandingTariff = {
  billing: { duration: number; period: 'forever' | 'month' }
  currencyCode: string
  formattedPrice: string
  freeOrganizations?: number
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
