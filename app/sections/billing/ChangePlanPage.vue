<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="change-plan-page">
        <div class="page-heading">
          <AppBackLink
            :label="t('back')"
            :to="backTo" />
          <div class="page-heading-text">
            <h2>{{ t('plans') }}</h2>
            <p class="muted">{{ t('currentPlan', { plan: page.subscriptionCode }) }}</p>
          </div>
        </div>

        <p
          v-if="!plans(page).length"
          class="muted">
          {{ t('noPlans') }}
        </p>
        <template v-else>
          <div class="plan-list">
            <article
              v-for="plan in plans(page)"
              :key="plan.id"
              class="plan-offer"
              :data-current="isCurrent(page, plan) ? 'true' : null">
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
                v-if="isCurrent(page, plan)"
                disabled>
                {{ t('active') }}
              </BaseButton>
              <BaseButton
                v-else-if="!plan.isFree"
                :disabled="!page.canPay"
                variant="primary"
                @click="select(plan)">
                {{ t('select') }}
              </BaseButton>
            </article>
          </div>

          <p
            v-if="!page.canPay"
            class="muted">
            {{ t('ownerOnly') }}
          </p>
        </template>
        <PlanPaymentDialog
          ref="paymentDialog"
          :message="checkout.message.value"
          :on-confirm="pay"
          :pending="checkout.pending.value"
          :plan="state.plan" />
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

import type {
  BillingPageData,
  BillingPageDeps,
  BillingPlanViewModel,
} from '~/sections/billing/BillingPage.deps'
import PlanPaymentDialog from '~/sections/billing/PlanPaymentDialog.vue'

// `onPay` receives the provider's payment address: the page is outside the app, so leaving for it
// is the page's navigation.
const props = defineProps<{
  backTo: RouteLocationRaw
  deps: BillingPageDeps
  onPay: (url: string) => void
}>()

const { t } = useI18n({
  en: {
    active: 'This plan is active',
    back: 'Back to the plan',
    currentPlan: 'Current plan: {plan}',
    issuesPerMonthLimit: '{count} issues per month',
    loadError: 'Could not load the plans',
    loading: 'Loading the plans…',
    noPlans: 'There are no plans to buy yet.',
    ownerOnly: 'Only the organization owner can pay for the plan.',
    perMonth: 'month',
    plans: 'Change plan',
    select: 'Select this plan',
    tokensPerMonth: '{count} tokens per month',
  },
  ru: {
    active: 'Этот тариф активен',
    back: 'Назад к тарифу',
    currentPlan: 'Текущий тариф: {plan}',
    issuesPerMonthLimit: '{count} задач в месяц',
    loadError: 'Не удалось загрузить тарифы',
    loading: 'Загрузка тарифов…',
    noPlans: 'Пока нет тарифов для покупки.',
    ownerOnly: 'Оплатить тариф может только владелец организации.',
    perMonth: 'месяц',
    plans: 'Сменить тариф',
    select: 'Выбрать тариф',
    tokensPerMonth: '{count} токенов в месяц',
  },
})

const { formatNumber } = useFormatters()
const paymentDialog = useTemplateRef('paymentDialog')
const state = reactive({ plan: undefined as BillingPlanViewModel | undefined })

const { data, message, pending, refresh } = await useApiQuery('billing-summary', (signal) =>
  props.deps.view({ signal }),
)

// The plans are a bonus on the page: when they cannot be loaded the page just says there are none.
const { data: planOptions } = await useApiQuery('billing-plans', (signal) =>
  props.deps.getPlans({ signal }),
)

const checkout = useApiAction(props.deps.startCheckout)

const plans = (page: BillingPageData) =>
  (page.kind === 'personal' ? planOptions.value?.personal : planOptions.value?.team) ?? []

const isCurrent = (page: BillingPageData, plan: BillingPlanViewModel) =>
  plan.title === page.subscriptionCode

const select = (plan: BillingPlanViewModel) => {
  state.plan = plan
  checkout.message.value = undefined
  paymentDialog.value?.open()
}

const pay = async () => {
  const { plan } = state
  if (!plan) {
    return
  }
  const result = await checkout.execute({ currencyCode: plan.currencyCode, planId: plan.id })
  if (result) {
    props.onPay(result.value.url)
  }
}
</script>

<style scoped>
.change-plan-page {
  align-content: start;
  display: grid;
  gap: var(--space-4);
}

.change-plan-page .page-heading-text {
  align-items: stretch;
  flex-direction: column;
  gap: 0;
}

.plan-list {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.plan-offer {
  align-content: start;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
}

.plan-offer[data-current='true'] {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}

.plan-name {
  display: block;
  font-size: var(--font-size-heading);
}

.plan-price {
  font-size: var(--font-size-heading);
}

.plan-features {
  align-content: start;
  display: grid;
  font-size: var(--font-size-small);
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (max-width: 767px) {
  .plan-list {
    grid-template-columns: 1fr;
  }
}
</style>
