<template>
  <section class="payment-result">
    <AppEmptyState
      :hint="t(`${status}Hint`)"
      :title="t(`${status}Title`)" />
    <BaseButton
      variant="primary"
      @click="onContinue">
      {{ t('continue') }}
    </BaseButton>
  </section>
</template>

<script setup lang="ts">
// Where the payment provider sends the customer back. Coming back is not a proof of payment: the
// provider confirms it to Billing separately, so the success text only says the plan is on its way.
defineProps<{ onContinue: () => void; status: 'fail' | 'success' }>()

const { t } = useI18n({
  en: {
    continue: 'Back to Laraue Boards',
    failHint: 'Check the payment status with your payment provider before trying again.',
    failTitle: 'Could not confirm the payment',
    successHint:
      'The plan is activated as soon as the payment is confirmed, usually within a minute.',
    successTitle: 'Thank you for your payment',
  },
  ru: {
    continue: 'Вернуться в Laraue Boards',
    failHint: 'Перед повторной оплатой проверьте статус платежа у платёжного провайдера.',
    failTitle: 'Не удалось подтвердить оплату',
    successHint:
      'Тариф будет активирован, как только оплата подтвердится, обычно в течение минуты.',
    successTitle: 'Спасибо за оплату',
  },
})
</script>

<style scoped>
.payment-result {
  display: grid;
  gap: var(--space-4);
  justify-items: center;
  padding: var(--space-8) var(--space-4);
}
</style>
