<template>
  <div
    :aria-describedby="textId"
    :aria-label="t('title')"
    aria-live="polite"
    class="cookie-consent"
    role="dialog">
    <p
      :id="textId"
      class="text">
      {{ t('text') }}
    </p>
    <div class="actions">
      <BaseButton @click="onChoice('denied')">
        {{ t('decline') }}
      </BaseButton>
      <BaseButton
        variant="primary"
        @click="onChoice('granted')">
        {{ t('accept') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

import type { ConsentChoice } from '#layers/core/app/analytics/consent/decision'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
defineProps<{ onChoice: (choice: ConsentChoice) => void }>()
const textId = useId()
const { t } = useI18n({
  en: {
    accept: 'Accept',
    decline: 'Decline',
    text: 'We use cookies for analytics to understand how visitors use this site. By continuing to browse, you agree to their use.',
    title: 'Analytics cookies',
  },
  ru: {
    accept: 'Принять',
    decline: 'Отклонить',
    text: 'Мы используем файлы cookie для аналитики, чтобы понимать, как посетители используют этот сайт. Продолжая пользоваться сайтом, вы соглашаетесь с их использованием.',
    title: 'Файлы cookie для аналитики',
  },
})
</script>

<style scoped>
.cookie-consent {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  bottom: 20px;
  box-shadow: var(--shadow-popover);
  display: flex;
  flex-direction: column;
  gap: 14px;
  left: 20px;
  margin-left: auto;
  max-width: 480px;
  padding: 18px 20px;
  position: fixed;
  right: 20px;
  z-index: 1000;
}

.text {
  color: var(--color-text);
  font-size: var(--font-size-body);
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (width <= 520px) {
  .cookie-consent {
    bottom: 12px;
    left: 12px;
    max-width: none;
    right: 12px;
  }
}
</style>
