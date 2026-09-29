import type { components } from '#infrastructure/api/billing.generated'
import type { BillingApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { GetTariffs } from '../LandingPage.deps'
import type { LandingTariff } from '../LandingPage.types'

type Schemas = components['schemas']
type PersonalTariff = Schemas['PersonalSubscriptionLaraueBoardsPersonalSubscription']
type TeamTariff = Schemas['TeamSubscriptionLaraueBoardsTeamSubscription']

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

export const createGetTariffs =
  (client: BillingApiClient): GetTariffs =>
  (currency) =>
    executeQuery({
      map: (data) => ({
        personal: data.personalSubscriptions.flatMap((tariff) =>
          tariff.type === 'MarkdownTranslatorPersonal'
            ? []
            : [mapTariff(tariff, tariff.limitFreeTeamOrganizationsCount)],
        ),
        team: data.teamSubscriptions.map((tariff) => mapTariff(tariff)),
      }),
      request: () =>
        client.GET('/api/tariffs', {
          params: { query: { CurrencyCode: currency, ServiceId: 'LaraueBoards' } },
        }),
    })
