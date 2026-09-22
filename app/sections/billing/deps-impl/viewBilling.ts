import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'

import type { BillingPageDeps } from '../BillingPage.deps'
import type { BillingUsageViewModel } from '../BillingPage.types'

type Schemas = components['schemas']

const mapUsage = (usage: null | Schemas['LimitUsage'] | undefined): BillingUsageViewModel | null =>
  usage
    ? {
        limit: Number(usage.limit),
        remaining: Number(usage.remaining),
        used: Number(usage.used),
      }
    : null

export const createViewBilling =
  (client: ApiClient): BillingPageDeps['view'] =>
  ({ signal }) =>
    executeQuery({
      map: (summary) => {
        if (!summary) {
          return undefined
        }
        const common = {
          issuesPerMonth: mapUsage(summary.issuesPerMonth),
          subscriptionCode: summary.subscriptionCode,
          tokens: mapUsage(summary.tokens)!,
        }
        if (summary.$type === 'personal') {
          return {
            ...common,
            freeTeamOrganizations: mapUsage(summary.freeTeamOrganizations),
            kind: 'personal' as const,
          }
        }
        return { ...common, kind: 'team' as const }
      },
      request: () => client.GET('/api/billing/summary', { signal }),
    })
