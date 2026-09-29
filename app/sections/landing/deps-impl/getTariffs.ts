import type { components } from '#infrastructure/api/billing.generated'
import type { BillingApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { GetTariffs } from '../LandingPage.deps'
import type { LandingTariff, LandingTariffs } from '../LandingPage.types'

type Schemas = components['schemas']
type PersonalTariff = Schemas['PersonalSubscriptionLaraueBoardsPersonalSubscription']
type TeamTariff = Schemas['TeamSubscriptionLaraueBoardsTeamSubscription']

// `type` is optional in the schema, so comparing it does not narrow the union by itself.
const isBoardsTariff = (
  tariff: PersonalTariff | Schemas['PersonalSubscriptionMarkdownTranslatorPersonalSubscription'],
): tariff is PersonalTariff => tariff.type !== 'MarkdownTranslatorPersonal'

// The API sends 64-bit and floating point numbers as `number | string`.
const toNumber = (value: null | number | string | undefined): number => Number(value ?? 0)

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
  freeOrganizations: toNumber(freeOrganizations) || undefined,
  id: tariff.id,
  issuesPerMonth: toNumber(tariff.limitIssuesPerMonth) || undefined,
  price: toNumber(tariff.price),
  title: tariff.title,
  tokens: toNumber(tariff.includedTokensCount),
})

// The response type is given explicitly: the endpoint documents no error responses, so it cannot
// be inferred from the request.
export const createGetTariffs =
  (client: BillingApiClient): GetTariffs =>
  (currency) =>
    executeQuery<Schemas['GetServiceTariffsResponse'], LandingTariffs>({
      map: (data) => ({
        personal: data.personalSubscriptions
          .filter(isBoardsTariff)
          .map((tariff) => mapTariff(tariff, tariff.limitFreeTeamOrganizationsCount)),
        team: data.teamSubscriptions.map((tariff) => mapTariff(tariff)),
      }),
      request: () =>
        client.GET('/api/tariffs', {
          params: { query: { CurrencyCode: currency, ServiceId: 'LaraueBoards' } },
        }),
    })
