<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="billing-page">
        <BaseSectionHeader :title="t('plan')" />
        <!-- One row per figure: what it is, how much is left with its bar, and what to do about it. -->
        <BaseList>
          <div class="usage-row">
            <span class="usage-label">{{ t('currentPlan') }}</span>
            <div class="usage-value">
              <strong>{{ page.subscriptionCode }}</strong>
              <p class="muted">
                {{ page.kind === 'personal' ? t('personalPlan') : t('teamPlan') }}
              </p>
              <p
                v-if="page.periodEndsAt"
                class="muted">
                {{ periodText(page) }}
              </p>
            </div>
            <BaseButton @click="onChangePlan">{{ t('changePlan') }}</BaseButton>
          </div>

          <div class="usage-row">
            <span class="usage-label">{{ t('tokens') }}</span>
            <div class="usage-value">
              <strong>{{ formatNumber(page.tokens.remaining + page.purchasedTokens.count) }}</strong>
              <div class="usage-bar">
                <span :style="{ width: usagePercent(page.tokens) }" />
              </div>
              <p class="usage-note muted">{{ tokensUsageText(page) }}</p>
            </div>
            <BaseButton @click="onBuyTokens">{{ t('buyTokens') }}</BaseButton>
          </div>

          <div
            v-if="page.issuesPerMonth"
            class="usage-row">
            <span class="usage-label">{{ t('issuesPerMonth') }}</span>
            <div class="usage-value">
              <strong>{{ formatNumber(page.issuesPerMonth.remaining) }}</strong>
              <div class="usage-bar">
                <span :style="{ width: usagePercent(page.issuesPerMonth) }" />
              </div>
              <p class="usage-note muted">{{ issuesUsageText(page, page.issuesPerMonth) }}</p>
            </div>
            <BaseButton @click="onChangePlan">{{ t('changePlan') }}</BaseButton>
          </div>

          <div
            v-if="page.kind === 'personal' && page.freeTeamOrganizations"
            class="usage-row">
            <span class="usage-label">{{ t('freeTeamOrganizations') }}</span>
            <div class="usage-value">
              <strong>{{ formatNumber(page.freeTeamOrganizations.remaining) }}</strong>
              <div class="usage-bar">
                <span :style="{ width: usagePercent(page.freeTeamOrganizations) }" />
              </div>
              <p class="usage-note muted">
                {{
                  t('usedOfLimitInPlan', {
                    limit: formatNumber(page.freeTeamOrganizations.limit),
                    used: formatNumber(page.freeTeamOrganizations.used),
                  })
                }}
              </p>
            </div>
            <BaseButton @click="onChangePlan">{{ t('changePlan') }}</BaseButton>
          </div>
        </BaseList>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import type {
  BillingPageData,
  BillingPageDeps,
  BillingUsageViewModel,
} from '~/sections/billing/plan/BillingPage.deps'

const props = defineProps<{
  deps: BillingPageDeps
  onBuyTokens: () => void
  onChangePlan: () => void
}>()

const { t } = useI18n({
  en: {
    activeUntil: 'Active until {date}',
    buyTokens: 'Buy tokens',
    changePlan: 'Change plan',
    currentPlan: 'Current plan',
    freeTeamOrganizations: 'Free team organizations left',
    issuesPerMonth: 'Issues left this month',
    loadError: 'Could not load billing summary',
    loading: 'Loading billing summary…',
    personalPlan: 'Personal plan',
    plan: 'Plan and usage',
    purchasedAll: '+ {count} purchased tokens that expire on {date}',
    purchasedNoDate: '+ {count} purchased tokens',
    purchasedPart: '+ {count} purchased tokens, {expiring} of them expire on {date}',
    resetsOn: 'Resets on {date}',
    teamPlan: 'Team plan',
    tokens: 'Tokens left',
    usedOfLimitInPlan: '{used} used of {limit} in the plan',
    usedOfLimitInPlanResets: '{used} used of {limit} in the plan, resets on {date}',
  },
  ru: {
    activeUntil: 'Действует до {date}',
    buyTokens: 'Купить токены',
    changePlan: 'Сменить тариф',
    currentPlan: 'Текущий тариф',
    freeTeamOrganizations: 'Осталось бесплатных командных организаций',
    issuesPerMonth: 'Осталось задач в этом месяце',
    loadError: 'Не удалось загрузить информацию о биллинге',
    loading: 'Загрузка информации о биллинге…',
    personalPlan: 'Персональный тариф',
    plan: 'Тариф и лимиты',
    purchasedAll: '+ {count} купленных токенов, которые сгорят {date}',
    purchasedNoDate: '+ {count} купленных токенов',
    purchasedPart: '+ {count} купленных токенов, {expiring} из них сгорят {date}',
    resetsOn: 'Обновится {date}',
    teamPlan: 'Командный тариф',
    tokens: 'Осталось токенов',
    usedOfLimitInPlan: 'использовано {used} из {limit} в тарифе',
    usedOfLimitInPlanResets: 'использовано {used} из {limit} в тарифе, обновится {date}',
  },
})

const { formatDate, formatNumber } = useFormatters()

const { data, message, pending, refresh } = await useApiQuery('billing-summary', (signal) =>
  props.deps.view({ signal }),
)

// "Resets on 6 Nov" for a Free plan, whose allowance starts over, "Active until 6 Nov" for a paid one.
const periodText = (page: BillingPageData) =>
  page.periodEndsAt
    ? t(page.periodResets ? 'resetsOn' : 'activeUntil', { date: formatDate(page.periodEndsAt) })
    : ''

// The purchased tokens and when they expire. The date is the nearest one, so unless all the tokens expire
// then, it says how many it concerns: "+ 125,000 purchased tokens, 25,000 of them expire on 6 Apr 2027".
const purchasedText = (page: BillingPageData) => {
  const { count, expireAt, expiringCount } = page.purchasedTokens
  const formattedCount = formatNumber(count)
  if (!expireAt) {
    return t('purchasedNoDate', { count: formattedCount })
  }

  const date = formatDate(expireAt)

  return expiringCount === count
    ? t('purchasedAll', { count: formattedCount, date })
    : t('purchasedPart', { count: formattedCount, date, expiring: formatNumber(expiringCount) })
}

// One readable line: "0 used of 25,000 in the plan + 100,000 purchased tokens that expire on 6 Apr 2027".
const tokensUsageText = (page: BillingPageData) => {
  const inPlan = t('usedOfLimitInPlan', {
    limit: formatNumber(page.tokens.limit),
    used: formatNumber(page.tokens.used),
  })

  return page.purchasedTokens.count > 0 ? `${inPlan} ${purchasedText(page)}` : inPlan
}

// One readable line: "0 used of 500 in the plan, resets on 6 Nov 2026".
const issuesUsageText = (page: BillingPageData, usage: BillingUsageViewModel) => {
  const values = { limit: formatNumber(usage.limit), used: formatNumber(usage.used) }

  return page.issuesResetAt
    ? t('usedOfLimitInPlanResets', { ...values, date: formatDate(page.issuesResetAt) })
    : t('usedOfLimitInPlan', values)
}

const usagePercent = (usage: BillingUsageViewModel) =>
  `${usage.limit > 0 ? Math.min(100, Math.max(0, (usage.used / usage.limit) * 100)) : 0}%`
</script>

<style scoped>
.billing-page {
  align-content: start;
  display: grid;
  gap: var(--space-5);
}

.usage-row {
  align-items: center;
  display: grid;
  gap: var(--space-2) var(--space-4);
  /* One action width for every row, so the bars end on one line. */
  grid-template-columns: 11rem minmax(0, 1fr) 8rem;
  padding: var(--space-4);
}

.usage-row > .base-button {
  justify-self: end;
}

.usage-row + .usage-row {
  border-top: 1px solid var(--color-divider);
}

.usage-label {
  align-self: start;
  color: var(--color-muted);
  font-weight: var(--font-weight-medium);
}

.usage-value {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.usage-value strong {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.usage-value p {
  margin: 0;
}

.usage-note {
  font-size: var(--font-size-sm);
}

.usage-bar {
  background: var(--color-soft);
  border-radius: var(--radius-full);
  height: 8px;
  overflow: hidden;
}

.usage-bar span {
  background: var(--color-accent);
  border-radius: inherit;
  display: block;
  height: 100%;
}

/* On a phone the label heads the row; the figure and its action share the line under it. */
@media (max-width: 767px) {
  .usage-row {
    grid-template-columns: minmax(0, 1fr) 8rem;
  }

  .usage-label {
    grid-column: 1 / -1;
  }
}
</style>
