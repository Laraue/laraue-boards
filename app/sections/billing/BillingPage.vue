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
        <div class="usage-grid">
          <article class="plan-card">
            <div class="card-header">
              <span class="eyebrow">{{ t('currentPlan') }}</span>
              <span
                v-if="page.periodEndsAt"
                class="muted">
                {{ periodText(page) }}
              </span>
            </div>
            <div>
              <strong class="plan-name">{{ page.subscriptionCode }}</strong>
              <p class="muted">
                {{ page.kind === 'personal' ? t('personalPlan') : t('teamPlan') }}
              </p>
            </div>
            <BaseButton
              class="card-action"
              @click="onChangePlan">
              {{ t('changePlan') }}
            </BaseButton>
          </article>

          <article class="usage-card">
            <div class="card-header">
              <div class="usage-heading">
                <span>{{ t('tokens') }}</span>
                <strong>{{ formatNumber(page.tokens.remaining + page.purchasedTokens.count) }}</strong>
              </div>
            </div>
            <div class="usage-bar">
              <span :style="{ width: usagePercent(page.tokens) }" />
            </div>
            <div class="usage-notes">
              <div class="usage-details muted">
                <span>
                  {{
                    t('usedOfLimitInPlan', {
                      limit: formatNumber(page.tokens.limit),
                      used: formatNumber(page.tokens.used),
                    })
                  }}
                </span>
              </div>
              <div
                v-if="page.purchasedTokens.count > 0"
                class="usage-details usage-details-spread muted">
                <span>{{ t('purchasedTokens', { count: formatNumber(page.purchasedTokens.count) }) }}</span>
                <span v-if="page.purchasedTokens.expireAt">{{ purchasedExpiryText(page) }}</span>
              </div>
            </div>
            <BaseButton
              class="card-action"
              @click="onBuyTokens">
              {{ t('buyTokens') }}
            </BaseButton>
          </article>

          <article
            v-if="page.issuesPerMonth"
            class="usage-card">
            <div class="card-header">
              <div class="usage-heading">
                <span>{{ t('issuesPerMonth') }}</span>
                <strong>{{ formatNumber(page.issuesPerMonth.remaining) }}</strong>
              </div>
            </div>
            <div class="usage-bar">
              <span :style="{ width: usagePercent(page.issuesPerMonth) }" />
            </div>
            <div class="usage-details muted">
              <span>{{ t('remaining') }}</span>
              <span>
                {{
                  t('usedOfLimit', {
                    limit: formatNumber(page.issuesPerMonth.limit),
                    used: formatNumber(page.issuesPerMonth.used),
                  })
                }}
              </span>
            </div>
            <BaseButton
              class="card-action"
              @click="onChangePlan">
              {{ t('changePlan') }}
            </BaseButton>
          </article>

          <article
            v-if="page.kind === 'personal' && page.freeTeamOrganizations"
            class="usage-card">
            <div class="card-header">
              <div class="usage-heading">
                <span>{{ t('freeTeamOrganizations') }}</span>
                <strong>{{ formatNumber(page.freeTeamOrganizations.remaining) }}</strong>
              </div>
            </div>
            <div class="usage-bar">
              <span :style="{ width: usagePercent(page.freeTeamOrganizations) }" />
            </div>
            <div class="usage-details muted">
              <span>{{ t('remaining') }}</span>
              <span>
                {{
                  t('usedOfLimit', {
                    limit: formatNumber(page.freeTeamOrganizations.limit),
                    used: formatNumber(page.freeTeamOrganizations.used),
                  })
                }}
              </span>
            </div>
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
} from '~/sections/billing/BillingPage.deps'

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
    freeTeamOrganizations: 'Free team organizations',
    issuesPerMonth: 'Issues this month',
    loadError: 'Could not load billing summary',
    loading: 'Loading billing summary…',
    personalPlan: 'Personal plan',
    purchasedExpire: '{count} of them expire on {date}',
    purchasedExpireAll: 'all expire on {date}',
    purchasedTokens: '+ {count} purchased tokens',
    remaining: 'remaining',
    resetsOn: 'Resets on {date}',
    teamPlan: 'Team plan',
    tokens: 'Tokens',
    usedOfLimit: '{used} used of {limit}',
    usedOfLimitInPlan: '{used} used of {limit} in the plan',
  },
  ru: {
    activeUntil: 'Действует до {date}',
    buyTokens: 'Купить токены',
    changePlan: 'Сменить тариф',
    currentPlan: 'Текущий тариф',
    freeTeamOrganizations: 'Бесплатные командные организации',
    issuesPerMonth: 'Задачи за месяц',
    loadError: 'Не удалось загрузить информацию о биллинге',
    loading: 'Загрузка информации о биллинге…',
    personalPlan: 'Персональный тариф',
    purchasedExpire: '{count} из них сгорят {date}',
    purchasedExpireAll: 'все сгорят {date}',
    purchasedTokens: '+ {count} купленных токенов',
    remaining: 'осталось',
    resetsOn: 'Обновится {date}',
    teamPlan: 'Командный тариф',
    tokens: 'Токены',
    usedOfLimit: 'использовано {used} из {limit}',
    usedOfLimitInPlan: 'использовано {used} из {limit} в тарифе',
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

// "25,000 of them expire on 6 Apr 2027": the date is the nearest one, so it says how many tokens it
// concerns unless they all expire then.
const purchasedExpiryText = (page: BillingPageData) => {
  const { count, expireAt, expiringCount } = page.purchasedTokens
  if (!expireAt) {
    return ''
  }

  const date = formatDate(expireAt)

  return expiringCount === count
    ? t('purchasedExpireAll', { date })
    : t('purchasedExpire', { count: formatNumber(expiringCount), date })
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

.plan-card,
.usage-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.plan-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

.plan-card p {
  margin: var(--space-1) 0 0;
}

.plan-name {
  display: block;
  font-size: var(--font-size-heading);
  margin-top: var(--space-1);
}

.eyebrow {
  color: var(--color-muted);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.usage-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.usage-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

/* A card has a header (its title on the left, a note such as the reset date on the right), its content and
   its action, which always sits in the bottom right corner: the cards of a row are as tall as the tallest,
   so the actions line up. */
.card-header {
  align-items: baseline;
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;
}

.card-action {
  align-self: flex-end;
  margin-top: auto;
}

.usage-card p {
  margin: 0;
}

/* The lines under the usage bar: close to each other, in the same size. */
.usage-notes {
  display: grid;
  gap: var(--space-1);
}


.usage-heading,
.usage-details {
  align-items: baseline;
  display: flex;
  gap: var(--space-3);
}

.usage-heading strong {
  font-size: var(--font-size-heading);
}

.usage-bar {
  background: var(--color-soft);
  border-radius: var(--radius-pill);
  height: 8px;
  overflow: hidden;
}

.usage-bar span {
  background: var(--color-accent);
  border-radius: inherit;
  display: block;
  height: 100%;
}

.usage-details {
  font-size: var(--font-size-small);
}

/* The note on the right, e.g. when the plan's allowance resets. */
.usage-details-spread {
  justify-content: space-between;
}

@media (max-width: 767px) {
  .usage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
