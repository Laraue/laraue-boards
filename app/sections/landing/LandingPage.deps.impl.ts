import type { components } from '#infrastructure/api/billing.generated'
import type { BillingApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { LandingPageDeps, LandingTariff } from './LandingPage.deps'

type Schemas = components['schemas']
type PersonalTariff = Schemas['PersonalSubscriptionLaraueBoardsPersonalSubscription']
type TeamTariff = Schemas['TeamSubscriptionLaraueBoardsTeamSubscription']

// `type` is optional in the schema, so comparing it does not narrow the union by itself.
const isBoardsTariff = (
  tariff: PersonalTariff | Schemas['PersonalSubscriptionMarkdownTranslatorPersonalSubscription'],
): tariff is PersonalTariff => tariff.type !== 'MarkdownTranslatorPersonal'

// The API sends 64-bit and floating point numbers as `number | string`.
const toNumber = (value: null | number | string | undefined): number => Number(value ?? 0)

// `undefined` is for a plan that has no such limit at all (team plans); `null` is a personal plan
// with no limit, i.e. unlimited team organizations.
const mapFreeOrganizations = (
  value: null | number | string | undefined,
): LandingTariff['freeOrganizations'] => {
  if (value === undefined || value === null) {
    return value
  }
  return toNumber(value) || undefined
}

const mapTariff = (
  tariff: PersonalTariff | TeamTariff,
  freeOrganizations?: null | number | string,
): LandingTariff => ({
  billing: {
    duration: toNumber(tariff.billingDuration ?? 1),
    period: tariff.billingPeriod === 'Forever' ? 'forever' : 'month',
  },
  currencyCode: tariff.currencyCode,
  formattedPrice: tariff.formattedPrice,
  freeOrganizations: mapFreeOrganizations(freeOrganizations),
  id: tariff.id,
  issuesPerMonth: toNumber(tariff.limitIssuesPerMonth) || undefined,
  price: toNumber(tariff.price),
  title: tariff.title,
  tokens: toNumber(tariff.includedTokensCount),
})

export const createLandingPageDeps = (client: BillingApiClient): LandingPageDeps => ({
  getTariffs: async () => {
    const data = await request(
      client.GET('/api/tariffs', {
        params: { query: { ServiceId: 'LaraueBoards' } },
      }),
    )
    return {
      personal: data.personalSubscriptions
        .filter(isBoardsTariff)
        .map((tariff) => mapTariff(tariff, tariff.limitFreeTeamOrganizationsCount ?? null)),
      team: data.teamSubscriptions.map((tariff) => mapTariff(tariff)),
    }
  },
})
