import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { request } from '#infrastructure/api/request'

import type { BillingPageDeps, BillingUsageViewModel } from './BillingPage.deps'

type Schemas = components['schemas']

const mapUsage = (usage: null | Schemas['LimitUsage'] | undefined): BillingUsageViewModel | null =>
  usage
    ? {
        limit: Number(usage.limit),
        remaining: Number(usage.remaining),
        used: Number(usage.used),
      }
    : null

export const createBillingPageDeps = (client: ApiClient): BillingPageDeps => ({
  view: async ({ signal }) => {
    const summary = await request(client.GET('/api/billing/summary', { signal }))
    const common = {
      canPay: summary.canPay,
      issuesPerMonth: mapUsage(summary.issuesPerMonth),
      issuesResetAt: summary.issuesResetAt ?? null,
      periodEndsAt: summary.periodEndsAt ?? null,
      periodResets: summary.periodResets ?? false,
      purchasedTokens: {
        count: Number(summary.purchasedTokensCount ?? 0),
        expireAt: summary.purchasedTokensExpireAt ?? null,
        expiringCount: Number(summary.purchasedTokensExpiringCount ?? 0),
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
