import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { request } from '#infrastructure/api/request'

import type { BillingPageDeps, BillingUsageViewModel } from './BillingPage.deps'

type Schemas = components['schemas']

const mapUsage = (usage: null | Schemas['LimitUsage'] | undefined): BillingUsageViewModel | null =>
  usage
    ? {
        limit: usage.limit,
        remaining: usage.remaining,
        used: usage.used,
      }
    : null

export const createBillingPageDeps = (client: ApiClient): BillingPageDeps => ({
  view: async ({ signal }) => {
    const summary = await request(client.GET('/api/billing/summary', { signal }))
    const common = {
      canPay: summary.canPay,
      issuesPerMonth: mapUsage(summary.issuesPerMonth),
      issuesResetAt: summary.issuesResetAt,
      periodEndsAt: summary.periodEndsAt,
      periodResets: summary.periodResets,
      purchasedTokens: {
        count: summary.purchasedTokensCount,
        expireAt: summary.purchasedTokensExpireAt,
        expiringCount: summary.purchasedTokensExpiringCount,
      },
      subscriptionCode: summary.subscriptionCode,
      tokens: mapUsage(summary.tokens)!,
    }
    if (summary.$type === 'personal') {
      return {
        ...common,
        freeTeamOrganizations: mapUsage(summary.freeTeamOrganizations),
        kind: 'personal',
      }
    }
    return { ...common, kind: 'team' }
  },
})
