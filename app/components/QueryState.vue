<template>
  <slot
    v-if="pending"
    name="loading">
    <section class="page-state">
      <span class="icon-badge loading">
        <IconLoader2 />
      </span>
      <p>{{ translatedLoadingText }}</p>
    </section>
  </slot>
  <section
    v-else-if="message !== undefined"
    class="page-state">
    <span class="icon-badge error">
      <IconAlertTriangle />
    </span>
    <h2>{{ translatedErrorTitle }}</h2>
    <p class="muted">{{ message }}</p>
    <div class="page-state-actions">
      <BaseButton
        v-if="onRetry"
        variant="primary"
        @click="onRetry">
        {{ translatedRetryText }}
      </BaseButton>
      <NuxtLink
        class="secondary"
        to="/organizations">
        {{ t('goHome') }}
      </NuxtLink>
    </div>
  </section>
  <slot
    v-else
    :data="data as Value" />
</template>

<script setup lang="ts" generic="Value">
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-vue'

const props = defineProps<{
  data?: Value
  errorTitle?: string
  loadingText?: string
  message?: string
  onRetry?: () => Promise<void> | void
  pending: boolean
  retryText?: string
}>()
const { t } = useI18n({
  en: {
    errorTitle: 'Could not load page',
    goHome: 'Go home',
    loadingText: 'Loading…',
    retry: 'Try again',
  },
  ru: {
    errorTitle: 'Не удалось загрузить страницу',
    goHome: 'На главную',
    loadingText: 'Загрузка…',
    retry: 'Повторить попытку',
  },
})
const translatedErrorTitle = computed(() => props.errorTitle ?? t('errorTitle'))
const translatedLoadingText = computed(() => props.loadingText ?? t('loadingText'))
const translatedRetryText = computed(() => props.retryText ?? t('retry'))

defineSlots<{
  default(props: { data: Value }): unknown
  loading?(): unknown
}>()
</script>

<style scoped>
.page-state {
  align-content: center;
  display: grid;
  gap: var(--space-3);
  justify-items: center;
  margin-inline: auto;
  max-width: 100%;
  padding: var(--space-8) var(--space-6);
  text-align: center;
  width: fit-content;
}

.page-state h2,
.page-state p {
  margin: 0;
}

.page-state h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.page-state-actions {
  display: flex;
  gap: var(--space-2);
}

.icon-badge {
  display: grid;
  height: 32px;
  place-items: center;
  width: 32px;
}

.icon-badge svg {
  height: 24px;
  width: 24px;
}

.icon-badge.loading {
  color: var(--color-muted);
}

.icon-badge.loading svg {
  animation: var(--animation-spin);
}

.icon-badge.error {
  color: var(--color-danger);
}

@media (max-width: 480px) {
  .page-state-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
