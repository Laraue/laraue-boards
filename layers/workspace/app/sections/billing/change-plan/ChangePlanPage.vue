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
        <BaseSectionHeader :title="t('plans')">
          <template #leading>
            <AppBackLink
              :label="t('back')"
              :to="backTo" />
          </template>
        </BaseSectionHeader>

        <BaseEmptyState
          v-if="!plans(page).length"
          :title="t('noPlans')" />
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
                <li>{{ t('storage', { size: formatMegabytes(plan.storageMegabytes) }) }}</li>
                <li v-if="plan.storageAddonPrices.length && addonTitles">
                  {{ t('storageAddonsAvailable', { addons: addonTitles }) }}
                </li>
              </ul>
              <!-- A paid plan is extended, or its storage changed, by paying for it again. -->
              <BaseButton
                v-if="isCurrent(page, plan) && !plan.isFree"
                :disabled="!page.canPay"
                @click="select(page, plan)">
                <IconRefresh />
                {{ t('extend') }}
              </BaseButton>
              <BaseButton
                v-else-if="isCurrent(page, plan)"
                disabled>
                <IconCheck />
                {{ t('active') }}
              </BaseButton>
              <BaseButton
                v-else-if="!plan.isFree"
                :disabled="!page.canPay"
                @click="select(page, plan)">
                <IconArrowRight />
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
        <PaymentDialog
          ref="paymentDialog"
          :conditions="dialogConditions"
          :message="checkout.message.value"
          :note="t('period')"
          :on-confirm="pay"
          :pending="checkout.pending.value"
          :price="price"
          :price-note="`/ ${t('perMonth')}`"
          :title="t('dialogTitle', { plan: state.plan?.title ?? '' })">
          <BaseField
            v-if="state.plan?.storageAddonPrices.length"
            class="storage-field"
            :label="t('extraStorage')">
            <BaseSelect
              v-model="state.storageAddonId"
              full-width
              :options="storageOptions" />
          </BaseField>
          <p
            v-if="state.overLimit"
            class="form-error">
            {{
              t('storageOverLimit', {
                excess: formatStorageSize(state.overLimit.excessBytes),
                quota: formatStorageSize(state.overLimit.quotaBytes),
                used: formatStorageSize(state.overLimit.usedBytes),
              })
            }}
          </p>
        </PaymentDialog>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { IconArrowRight, IconCheck, IconRefresh } from '@tabler/icons-vue'
import { computed, reactive, useTemplateRef } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseEmptyState from '#layers/core/app/ui/components/BaseEmptyState.vue'
import BaseField from '#layers/core/app/ui/components/BaseField.vue'
import BaseSectionHeader from '#layers/core/app/ui/components/BaseSectionHeader.vue'
import BaseSelect from '#layers/core/app/ui/components/BaseSelect.vue'
import type {
  BillingPlanViewModel,
  ChangePlanPageData,
  ChangePlanPageDeps,
  CheckoutResult,
} from '#layers/workspace/app/sections/billing/change-plan/ChangePlanPage.deps'
import PaymentDialog from '#layers/workspace/app/sections/billing/components/PaymentDialog/PaymentDialog.vue'
import AppBackLink from '#layers/workspace/app/shared/components/AppBackLink.vue'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'
import { useFormatters } from '#layers/workspace/app/shared/composables/useFormatters'

// `onPay` receives the provider's payment address: the page is outside the app, so leaving for it
// is the page's navigation.
const props = defineProps<{
  backTo: RouteLocationRaw
  deps: ChangePlanPageDeps
  onPay: (url: string) => void
}>()

const { t } = useI18n({
  en: {
    active: 'This plan is active',
    back: 'Back to the plan',
    dialogTitle: 'Plan “{plan}”',
    extend: 'Extend or change storage',
    extraStorage: 'Extra storage',
    issuesPerMonthLimit: '{count} issues per month',
    loadError: 'Could not load the plans',
    loading: 'Loading the plans…',
    noPlans: 'There are no plans to buy yet.',
    ownerOnly: 'Only the organization owner can pay for the plan.',
    period: 'Paid for one month, then the plan ends unless you extend it',
    perMonth: 'month',
    plans: 'Change plan',
    select: 'Select this plan',
    storage: '{size} of file storage',
    storageAddon: '{title} for {price} / month',
    storageAddonsAvailable: 'More storage can be added: {addons}',
    storageNone: 'No extra storage',
    storageOverLimit:
      'Your files take {used}, and this choice gives {quota}. Delete {excess} of files first, or choose more storage.',
    storageTotal: '{size} of file storage in total',
    tokensPerMonth: '{count} tokens per month',
  },
  ru: {
    active: 'Этот тариф активен',
    back: 'Назад к тарифу',
    dialogTitle: 'Тариф «{plan}»',
    extend: 'Продлить или изменить место',
    extraStorage: 'Дополнительное место',
    issuesPerMonthLimit: '{count} задач в месяц',
    loadError: 'Не удалось загрузить тарифы',
    loading: 'Загрузка тарифов…',
    noPlans: 'Пока нет тарифов для покупки.',
    ownerOnly: 'Оплатить тариф может только владелец организации.',
    period: 'Оплата за один месяц, затем тариф закончится, если его не продлить',
    perMonth: 'месяц',
    plans: 'Сменить тариф',
    select: 'Выбрать тариф',
    storage: '{size} для файлов',
    storageAddon: '{title} за {price} / месяц',
    storageAddonsAvailable: 'Можно добавить место: {addons}',
    storageNone: 'Без дополнительного места',
    storageOverLimit:
      'Ваши файлы занимают {used}, а при таком выборе будет {quota}. Сначала удалите файлы на {excess} или выберите больше места.',
    storageTotal: 'Всего {size} для файлов',
    tokensPerMonth: '{count} токенов в месяц',
  },
})

const { formatNumber, formatStorageSize } = useFormatters()
const paymentDialog = useTemplateRef('paymentDialog')

// The add-on is chosen in the dialog; '' is "no extra storage", the select needs a string value.
const state = reactive({
  overLimit: undefined as Extract<CheckoutResult, { kind: 'storageOverLimit' }> | undefined,
  plan: undefined as BillingPlanViewModel | undefined,
  storageAddonId: '',
})

const megabyte = 1024 * 1024
const formatMegabytes = (megabytes: number) => formatStorageSize(megabytes * megabyte)

const { data, message, pending, refresh } = await useApiQuery('change-plan-summary', (signal) =>
  props.deps.view({ signal }),
)

// The plans are a bonus on the page: when they cannot be loaded the page just says there are none.
const { data: planOptions } = await useApiQuery('billing-plans', (signal) =>
  props.deps.getPlans({ signal }),
)

const checkout = useApiAction(props.deps.startCheckout)

const selectedAddon = computed(() =>
  planOptions.value?.storageAddons.find((addon) => addon.id === state.storageAddonId),
)

// The plan with the chosen add-on is one price, the one the checkout charges.
const price = computed(() => {
  const { plan } = state
  const addonPrice = plan?.storageAddonPrices.find(
    (candidate) => candidate.addonId === state.storageAddonId,
  )
  return addonPrice?.formattedPrice ?? plan?.formattedPrice
})

const addonTitles = computed(() =>
  (planOptions.value?.storageAddons ?? []).map((addon) => addon.title).join(', '),
)

const storageOptions = computed(() => [
  { label: t('storageNone'), value: '' },
  ...(planOptions.value?.storageAddons ?? []).map((addon) => ({
    label: t('storageAddon', { price: addon.formattedPrice, title: addon.title }),
    value: addon.id,
  })),
])

const dialogConditions = computed(() => {
  const { plan } = state
  if (!plan) {
    return []
  }
  return [
    t('tokensPerMonth', { count: formatNumber(plan.tokens) }),
    ...(plan.issuesPerMonth
      ? [t('issuesPerMonthLimit', { count: formatNumber(plan.issuesPerMonth) })]
      : []),
    t('storageTotal', {
      size: formatMegabytes(plan.storageMegabytes + (selectedAddon.value?.storageMegabytes ?? 0)),
    }),
  ]
})

const plans = (page: ChangePlanPageData) =>
  (page.kind === 'personal' ? planOptions.value?.personal : planOptions.value?.team) ?? []

const isCurrent = (page: ChangePlanPageData, plan: BillingPlanViewModel) =>
  plan.title === page.subscriptionCode

// The add-on the plan has stays chosen, so paying again keeps the storage unless it's changed.
const select = (page: ChangePlanPageData, plan: BillingPlanViewModel) => {
  state.plan = plan
  state.storageAddonId = plan.storageAddonPrices.some(
    (addonPrice) => addonPrice.addonId === page.storageAddonId,
  )
    ? (page.storageAddonId ?? '')
    : ''
  state.overLimit = undefined
  checkout.message.value = undefined
  paymentDialog.value?.open()
}

const pay = async () => {
  const { plan } = state
  if (!plan) {
    return
  }
  state.overLimit = undefined
  const result = await checkout.execute({
    currencyCode: plan.currencyCode,
    itemId: plan.id,
    kind: 'Subscription',
    storageAddonId: state.storageAddonId || null,
  })
  if (!result) {
    return
  }
  if (result.value.kind === 'storageOverLimit') {
    state.overLimit = result.value
    return
  }
  props.onPay(result.value.url)
}
</script>

<style scoped>
.change-plan-page {
  align-content: start;
  display: grid;
  gap: var(--space-4);
}

.plan-list {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

/* Price first, what it includes, then the choice at the bottom: the buttons of a row line up. */
.plan-offer {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: var(--radius-card);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

.plan-offer > .base-button {
  margin-top: auto;
}

.plan-offer[data-current='true'] {
  border-color: var(--color-accent);
  box-shadow: inset 0 0 0 1px var(--color-accent);
}

.plan-name {
  display: block;
  font-weight: var(--font-weight-medium);
}

.plan-price {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  margin: var(--space-1) 0 0;
}

.plan-price .muted {
  font-size: var(--font-size-body);
  font-weight: 400;
}

.storage-field {
  margin-top: var(--space-4);
}

.form-error {
  color: var(--color-danger);
}

.plan-features {
  align-content: start;
  display: grid;
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
