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
            <div>
              <span class="eyebrow">{{ t('currentPlan') }}</span>
              <strong class="plan-name">{{ page.subscriptionCode }}</strong>
              <p class="muted">
                {{ page.kind === 'personal' ? t('personalPlan') : t('teamPlan') }}
              </p>
            </div>
          </article>

          <article class="usage-card">
            <div class="usage-heading">
              <span>{{ t('tokens') }}</span>
              <strong>{{ formatNumber(page.tokens.remaining) }}</strong>
            </div>
            <div class="usage-bar">
              <span :style="{ width: usagePercent(page.tokens) }" />
            </div>
            <div class="usage-details muted">
              <span>{{ t('remaining') }}</span>
              <span>
                {{ t('usedOfLimit', { limit: page.tokens.limit, used: page.tokens.used }) }}
              </span>
            </div>
          </article>

          <article
            v-if="page.issuesPerMonth"
            class="usage-card">
            <div class="usage-heading">
              <span>{{ t('issuesPerMonth') }}</span>
              <strong>{{ formatNumber(page.issuesPerMonth.remaining) }}</strong>
            </div>
            <div class="usage-bar">
              <span :style="{ width: usagePercent(page.issuesPerMonth) }" />
            </div>
            <div class="usage-details muted">
              <span>{{ t('remaining') }}</span>
              <span>
                {{
                  t('usedOfLimit', {
                    limit: page.issuesPerMonth.limit,
                    used: page.issuesPerMonth.used,
                  })
                }}
              </span>
            </div>
          </article>

          <article
            v-if="page.kind === 'personal' && page.freeTeamOrganizations"
            class="usage-card">
            <div class="usage-heading">
              <span>{{ t('freeTeamOrganizations') }}</span>
              <strong>{{ formatNumber(page.freeTeamOrganizations.remaining) }}</strong>
            </div>
            <div class="usage-bar">
              <span :style="{ width: usagePercent(page.freeTeamOrganizations) }" />
            </div>
            <div class="usage-details muted">
              <span>{{ t('remaining') }}</span>
              <span>
                {{
                  t('usedOfLimit', {
                    limit: page.freeTeamOrganizations.limit,
                    used: page.freeTeamOrganizations.used,
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
import type { BillingPageDeps } from '~/sections/billing/BillingPage.deps'
import type { BillingUsageViewModel } from '~/sections/billing/BillingPage.types'

const props = defineProps<{ deps: BillingPageDeps }>()

const { t } = useI18n({
  en: {
    currentPlan: 'Current plan',
    freeTeamOrganizations: 'Free team organizations',
    issuesPerMonth: 'Issues this month',
    loadError: 'Could not load billing summary',
    loading: 'Loading billing summary…',
    personalPlan: 'Personal plan',
    remaining: 'remaining',
    teamPlan: 'Team plan',
    tokens: 'Tokens',
    usedOfLimit: '{used} used of {limit}',
  },
  ru: {
    currentPlan: 'Текущий тариф',
    freeTeamOrganizations: 'Бесплатные командные организации',
    issuesPerMonth: 'Задачи за месяц',
    loadError: 'Не удалось загрузить информацию о биллинге',
    loading: 'Загрузка информации о биллинге…',
    personalPlan: 'Персональный тариф',
    remaining: 'осталось',
    teamPlan: 'Командный тариф',
    tokens: 'Токены',
    usedOfLimit: 'использовано {used} из {limit}',
  },
})

const { formatNumber } = useFormatters()
const { data, message, pending, refresh } = await useQuery(
  'billing-summary',
  (_nuxtApp, { signal }) => props.deps.view({ signal }),
)

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
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  padding: var(--space-5);
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
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
}

.usage-heading,
.usage-details {
  align-items: baseline;
  display: flex;
  gap: var(--space-2);
  justify-content: space-between;
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

@media (max-width: 767px) {
  .plan-card {
    align-items: stretch;
    flex-direction: column;
  }

  .usage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
