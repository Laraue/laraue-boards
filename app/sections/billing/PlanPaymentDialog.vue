<template>
  <dialog ref="dialog">
    <form @submit.prevent="onConfirm">
      <h2>{{ t('title', { plan: plan?.title ?? '' }) }}</h2>
      <template v-if="plan">
        <p class="plan-price">
          {{ plan.formattedPrice }}
          <span class="muted">/ {{ t('perMonth') }}</span>
        </p>
        <ul class="plan-conditions">
          <li>{{ t('period') }}</li>
          <li>{{ t('tokensPerMonth', { count: formatNumber(plan.tokens) }) }}</li>
          <li v-if="plan.issuesPerMonth">
            {{ t('issuesPerMonthLimit', { count: formatNumber(plan.issuesPerMonth) }) }}
          </li>
        </ul>
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
  font-size: var(--font-size-heading);
  margin: var(--space-2) 0 var(--space-3);
}

.plan-conditions {
  display: grid;
  gap: var(--space-1);
  list-style: none;
  margin: 0 0 var(--space-4);
  padding: 0;
}

.form-error {
  color: var(--color-danger);
}
</style>
