<template>
  <slot
    v-if="pending"
    name="loading">
    <section class="page-state">
      <span class="icon-badge loading">
        <Loader />
      </span>
      <p>{{ translatedLoadingText }}</p>
    </section>
  </slot>
  <section
    v-else-if="message !== undefined"
    class="page-state">
    <span class="icon-badge error">
      <AlertTriangle />
    </span>
    <h2>{{ translatedErrorTitle }}</h2>
    <p class="muted">{{ message }}</p>
    <div class="page-state-actions">
      <button
        v-if="onRetry"
        class="primary"
        type="button"
        @click="onRetry">
        {{ translatedRetryText }}
      </button>
      <NuxtLink
        class="secondary"
        to="/">
        {{ t('goHome') }}
      </NuxtLink>
    </div>
  </section>
  <slot
    v-else
    :data="data as Value" />
</template>

<script setup lang="ts" generic="Value">
import { AlertTriangle, Loader } from '@lucide/vue'

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
  padding: var(--space-6);
  text-align: center;
  width: fit-content;
}

.page-state h2,
.page-state p {
  margin: 0;
}

.page-state-actions {
  display: flex;
  gap: var(--space-2);
}

.icon-badge {
  border-radius: var(--radius-card);
  display: grid;
  height: 56px;
  place-items: center;
  width: 56px;
}

.icon-badge svg {
  height: 28px;
  width: 28px;
}

.icon-badge.loading {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.icon-badge.loading svg {
  animation: var(--animation-spin);
}

.icon-badge.error {
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
}

@media (max-width: 480px) {
  .page-state-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
