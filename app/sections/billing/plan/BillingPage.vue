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
        <!-- The plan is the context of the figures under it, so it heads the section; a limit card keeps
             its own way to lift that limit. -->
        <BaseSectionHeader :title="t('plan')">
          <template #actions>
            <BaseButton @click="onChangePlan">{{ t('changePlan') }}</BaseButton>
          </template>
        </BaseSectionHeader>
        <div class="plan-summary">
          <p>
            <strong>{{ page.subscriptionCode }}</strong>
            <span class="muted">
              {{ page.kind === 'personal' ? t('personalPlan') : t('teamPlan') }}
            </span>
          </p>
          <p
            v-if="page.periodEndsAt"
            class="muted">
            {{ periodText(page) }}
          </p>
        </div>

        <div class="usage-grid">
          <article class="usage-card">
            <span class="usage-label">{{ t('tokens') }}</span>
            <strong class="usage-value">{{ formatNumber(page.tokens.remaining + page.purchasedTokens.count) }}</strong>
            <div class="usage-bar">
              <span :style="{ width: usagePercent(page.tokens) }" />
            </div>
            <p class="usage-note muted">{{ tokensUsageText(page) }}</p>
            <BaseButton
              class="usage-action"
              @click="onBuyTokens">
              {{ t('buyTokens') }}
            </BaseButton>
          </article>

          <article
            v-if="page.issuesPerMonth"
            class="usage-card">
            <span class="usage-label">{{ t('issuesPerMonth') }}</span>
            <strong class="usage-value">{{ formatNumber(page.issuesPerMonth.remaining) }}</strong>
            <div class="usage-bar">
              <span :style="{ width: usagePercent(page.issuesPerMonth) }" />
            </div>
            <p class="usage-note muted">{{ issuesUsageText(page, page.issuesPerMonth) }}</p>
            <BaseButton
              class="usage-action"
              @click="onChangePlan">
              {{ t('changePlan') }}
            </BaseButton>
          </article>

          <article
            v-if="page.kind === 'personal' && page.freeTeamOrganizations"
            class="usage-card">
            <span class="usage-label">{{ t('freeTeamOrganizations') }}</span>
            <strong class="usage-value">{{ formatNumber(page.freeTeamOrganizations.remaining) }}</strong>
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
            <BaseButton
              class="usage-action"
              @click="onChangePlan">
              {{ t('changePlan') }}
            </BaseButton>
          </article>
        </div>
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

.plan-summary {
  display: grid;
  gap: var(--space-1);
}

.plan-summary p {
  margin: 0;
}

.plan-summary strong {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-right: var(--space-2);
}

.usage-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
}

.usage-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: var(--radius-card);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
}

.usage-label {
  color: var(--color-muted);
  font-weight: var(--font-weight-medium);
}

.usage-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.usage-note {
  font-size: var(--font-size-sm);
  margin: 0;
}

.usage-action {
  align-self: flex-end;
  margin-top: auto;
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
</style>
