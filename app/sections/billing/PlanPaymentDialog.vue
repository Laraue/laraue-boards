<template>
  <dialog ref="dialog">
    <form @submit.prevent="onConfirm">
      <h2>{{ t('title', { plan: plan?.title ?? '' }) }}</h2>
      <template v-if="plan">
        <p class="plan-price">
          <strong>{{ plan.formattedPrice }}</strong>
          <span class="muted">/ {{ t('perMonth') }}</span>
        </p>
        <ul class="plan-conditions">
          <li>
            <IconCheck />
            {{ t('tokensPerMonth', { count: formatNumber(plan.tokens) }) }}
          </li>
          <li v-if="plan.issuesPerMonth">
            <IconCheck />
            {{ t('issuesPerMonthLimit', { count: formatNumber(plan.issuesPerMonth) }) }}
          </li>
        </ul>
        <p class="plan-period muted">{{ t('period') }}</p>
      </template>
      <BaseCheckbox v-model="accepted">
        {{ t('accept') }}
        <NuxtLink
          target="_blank"
          :to="termsPath">
          {{ t('offer') }}
        </NuxtLink>
      </BaseCheckbox>
      <p
        v-if="message"
        class="form-error">
        {{ message }}
      </p>
      <div class="dialog-actions">
        <BaseButton
          :disabled="pending"
          @click="dialog?.close()">
          {{ t('cancel') }}
        </BaseButton>
        <BaseButton
          :disabled="!accepted"
          :loading="pending"
          type="submit"
          variant="primary">
          {{ t('pay', { price: plan?.formattedPrice ?? '' }) }}
        </BaseButton>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { IconCheck } from '@tabler/icons-vue'

import type { BillingPlanViewModel } from '~/sections/billing/BillingPage.deps'

// The dialog only collects the consent: the payment itself is started by the page in `onConfirm`.
defineProps<{
  message: string | undefined
  onConfirm: () => void
  pending: boolean
  plan: BillingPlanViewModel | undefined
}>()

const { t } = useI18n({
  en: {
    accept: 'I accept the',
    cancel: 'Cancel',
    issuesPerMonthLimit: '{count} issues per month',
    offer: 'public offer',
    pay: 'Pay {price}',
    period: 'Paid for one month, then the plan ends unless you extend it',
    perMonth: 'month',
    title: 'Plan “{plan}”',
    tokensPerMonth: '{count} tokens per month',
  },
  ru: {
    accept: 'Я принимаю условия',
    cancel: 'Отмена',
    issuesPerMonthLimit: '{count} задач в месяц',
    offer: 'публичной оферты',
    pay: 'Оплатить {price}',
    period: 'Оплата за один месяц, затем тариф закончится, если его не продлить',
    perMonth: 'месяц',
    title: 'Тариф «{plan}»',
    tokensPerMonth: '{count} токенов в месяц',
  },
})

const { formatNumber } = useFormatters()
const locale = useLocale()

const accepted = ref(false)
const dialog = useTemplateRef('dialog')

const termsPath = computed(() => (locale.value === 'ru' ? '/ru/terms' : '/terms'))

const open = () => {
  accepted.value = false
  dialog.value?.showModal()
}

const close = () => dialog.value?.close()

defineExpose({ close, open })
</script>

<style scoped>
.plan-price {
  align-items: baseline;
  display: flex;
  gap: var(--space-2);
  margin: var(--space-2) 0 var(--space-4);
}

.plan-price strong {
  font-size: 32px;
  letter-spacing: -0.02em;
}

.plan-conditions {
  background: var(--color-soft);
  border-radius: var(--radius-card);
  display: grid;
  gap: var(--space-2);
  list-style: none;
  margin: 0;
  padding: var(--space-3) var(--space-4);
}

.plan-conditions li {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.plan-conditions svg {
  color: var(--color-accent);
  flex-shrink: 0;
  height: 16px;
  width: 16px;
}

.plan-period {
  font-size: var(--font-size-small);
  margin: var(--space-2) 0 var(--space-4);
}

.form-error {
  color: var(--color-danger);
}
</style>
