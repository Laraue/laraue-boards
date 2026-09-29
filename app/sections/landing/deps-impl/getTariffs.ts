import type { GetTariffs } from '../LandingPage.deps'
import type { LandingTariff } from '../LandingPage.types'

// The Billing API's tariff, as returned for the LaraueBoards service.
type BillingTariff = {
  billingDuration: null | number
  billingPeriod: 'Forever' | 'Month'
  currencyCode: string
  formattedPrice: string
  id: string
  includedTokensCount: number
  limitFreeTeamOrganizationsCount?: null | number
  limitIssuesPerMonth?: null | number
  price: number
  title: string
}

type BillingTariffs = {
  personalSubscriptions: BillingTariff[]
  teamSubscriptions: BillingTariff[]
}

const mapTariff = (tariff: BillingTariff): LandingTariff => ({
  billing: {
    duration: tariff.billingDuration ?? 1,
    period: tariff.billingPeriod === 'Forever' ? 'forever' : 'month',
  },
  currencyCode: tariff.currencyCode,
  formattedPrice: tariff.formattedPrice,
  freeOrganizations: tariff.limitFreeTeamOrganizationsCount || undefined,
  id: tariff.id,
  issuesPerMonth: tariff.limitIssuesPerMonth || undefined,
  price: tariff.price,
  title: tariff.title,
  tokens: tariff.includedTokensCount,
})

export const createGetTariffs =
  (baseUrl: string, fetchImpl: typeof globalThis.fetch = globalThis.fetch): GetTariffs =>
  async (currency) => {
    try {
      const query = new URLSearchParams({ currencyCode: currency, serviceId: 'LaraueBoards' })
      const response = await fetchImpl(`${baseUrl}/tariffs?${query}`)
      if (!response.ok) {
        return { code: response.status, status: 'error' }
      }

      const tariffs = (await response.json()) as BillingTariffs
      return {
        data: {
          personal: tariffs.personalSubscriptions.map(mapTariff),
          team: tariffs.teamSubscriptions.map(mapTariff),
        },
        status: 'success',
      }
    } catch {
      return { code: 0, status: 'error' }
    }
  }
