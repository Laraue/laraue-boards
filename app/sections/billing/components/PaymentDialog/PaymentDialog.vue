<template>
  <dialog ref="dialog">
    <form @submit.prevent="onConfirm">
      <h2>{{ title }}</h2>
      <template v-if="price">
        <p class="plan-price">
          <strong>{{ price }}</strong>
          <span
            v-if="priceNote"
            class="muted">
            {{ priceNote }}
          </span>
        </p>
        <ul class="plan-conditions">
          <li
            v-for="condition in conditions"
            :key="condition">
            <IconCheck />
            {{ condition }}
          </li>
        </ul>
        <p
          v-if="note"
          class="plan-period muted">
          {{ note }}
        </p>
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
          {{ t('pay', { price: price ?? '' }) }}
        </BaseButton>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { IconCheck } from '@tabler/icons-vue'

// The dialog shows what is bought and only collects the consent: the payment itself is started by the
// page in `onConfirm`. It is the same for a plan and for a token pack, the page describes the item.
defineProps<{
  // What is bought, one line each, e.g. the tokens and the limits that come with it.
  conditions: string[]
  message: string | undefined
  // A short remark under the conditions, e.g. how long the purchase lasts.
  note?: string
  onConfirm: () => void
  pending: boolean
  // The formatted price, also on the pay button. Nothing is shown until an item is chosen.
  price: string | undefined
  // Said next to the price, e.g. "/ month".
  priceNote?: string
  title: string
}>()

const { t } = useI18n({
  en: {
    accept: 'I accept the',
    cancel: 'Cancel',
    offer: 'public offer',
    pay: 'Pay {price}',
  },
  ru: {
    accept: 'Я принимаю условия',
    cancel: 'Отмена',
    offer: 'публичной оферты',
    pay: 'Оплатить {price}',
  },
})

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
