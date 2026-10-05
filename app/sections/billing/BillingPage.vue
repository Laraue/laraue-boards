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

        <section
          v-if="plans(page).length"
          class="plans">
          <h2>{{ t('plans') }}</h2>
          <div class="plan-list">
            <article
              v-for="plan in plans(page)"
              :key="plan.id"
              class="plan-offer">
              <div>
                <strong class="plan-name">{{ plan.title }}</strong>
                <p class="plan-price">
                  {{ plan.formattedPrice }}
                  <span class="muted">/ {{ t('perMonth') }}</span>
                </p>
              </div>
              <ul class="plan-features muted">
                <li>{{ t('tokensPerMonth', { count: formatNumber(plan.tokens) }) }}</li>
                <li v-if="plan.issuesPerMonth">
                  {{ t('issuesPerMonthLimit', { count: formatNumber(plan.issuesPerMonth) }) }}
                </li>
              </ul>
              <BaseButton
                :disabled="!page.canPay || !state.accepted"
                :loading="checkout.pending.value && state.planId === plan.id"
                variant="primary"
                @click="buy(plan)">
                {{ plan.title === page.subscriptionCode ? t('extend') : t('buy') }}
              </BaseButton>
            </article>
          </div>

          <BaseCheckbox
            v-model="state.accepted"
            :disabled="!page.canPay">
            {{ t('accept') }}
            <NuxtLink
              target="_blank"
              :to="termsPath">
              {{ t('offer') }}
            </NuxtLink>
          </BaseCheckbox>
          <p
            v-if="!page.canPay"
            class="muted">
            {{ t('ownerOnly') }}
          </p>
          <p
            v-else-if="checkout.message.value"
            class="error">
            {{ checkout.message.value }}
          </p>
        </section>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import type {
  BillingPageData,
  BillingPageDeps,
  BillingPlanViewModel,
  BillingUsageViewModel,
} from '~/sections/billing/BillingPage.deps'

// `onPay` receives the provider's payment address: the page is outside the app, so leaving for it
// is the page's navigation.
const props = defineProps<{ deps: BillingPageDeps; onPay: (url: string) => void }>()

const { t } = useI18n({
  en: {
    accept: 'I accept the',
    buy: 'Buy',
    currentPlan: 'Current plan',
    extend: 'Extend',
    freeTeamOrganizations: 'Free team organizations',
    issuesPerMonth: 'Issues this month',
    issuesPerMonthLimit: '{count} issues per month',
    loadError: 'Could not load billing summary',
    loading: 'Loading billing summary…',
    offer: 'public offer',
    ownerOnly: 'Only the organization owner can pay for the plan.',
    perMonth: 'month',
    personalPlan: 'Personal plan',
    plans: 'Plans',
    remaining: 'remaining',
    teamPlan: 'Team plan',
    tokens: 'Tokens',
    tokensPerMonth: '{count} tokens per month',
    usedOfLimit: '{used} used of {limit}',
  },
  ru: {
    accept: 'Я принимаю условия',
    buy: 'Купить',
    currentPlan: 'Текущий тариф',
    extend: 'Продлить',
    freeTeamOrganizations: 'Бесплатные командные организации',
    issuesPerMonth: 'Задачи за месяц',
    issuesPerMonthLimit: '{count} задач в месяц',
    loadError: 'Не удалось загрузить информацию о биллинге',
    loading: 'Загрузка информации о биллинге…',
    offer: 'публичной оферты',
    ownerOnly: 'Оплатить тариф может только владелец организации.',
    perMonth: 'месяц',
    personalPlan: 'Персональный тариф',
    plans: 'Тарифы',
    remaining: 'осталось',
    teamPlan: 'Командный тариф',
    tokens: 'Токены',
    tokensPerMonth: '{count} токенов в месяц',
    usedOfLimit: 'использовано {used} из {limit}',
  },
})

const { formatNumber } = useFormatters()
const locale = useLocale()
const state = reactive({ accepted: false, planId: undefined as string | undefined })

const { data, message, pending, refresh } = await useApiQuery('billing-summary', (signal) =>
  props.deps.view({ signal }),
)

// The plans are a bonus on the page: when they cannot be loaded the usage is still shown.
const { data: planOptions } = await useApiQuery('billing-plans', (signal) =>
  props.deps.getPlans({ signal }),
)

const checkout = useApiAction(props.deps.startCheckout)

const termsPath = computed(() => (locale.value === 'ru' ? '/ru/terms' : '/terms'))

const plans = (page: BillingPageData) =>
  (page.kind === 'personal' ? planOptions.value?.personal : planOptions.value?.team) ?? []

const buy = async (plan: BillingPlanViewModel) => {
  state.planId = plan.id
  const result = await checkout.execute({ currencyCode: plan.currencyCode, planId: plan.id })
  if (result) {
    props.onPay(result.value.url)
  }
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

.plans {
  display: grid;
  gap: var(--space-3);
}

.plans h2 {
  font-size: var(--font-size-heading);
  margin: 0;
}

.plan-list {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.plan-offer {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
}

.plan-price {
  font-size: var(--font-size-heading);
  margin: var(--space-1) 0 0;
}

.plan-features {
  display: grid;
  font-size: var(--font-size-small);
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.error {
  color: var(--color-danger);
  margin: 0;
}

@media (max-width: 767px) {
  .plan-list {
    grid-template-columns: 1fr;
  }

  .plan-card {
    align-items: stretch;
    flex-direction: column;
  }

  .usage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
