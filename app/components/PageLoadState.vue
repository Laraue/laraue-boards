<template>
  <section class="page-load-state">
    <div
      class="state"
      :class="{ hidden: !loading }">
      <span class="icon-badge loading">
        <Loader />
      </span>
      <p>{{ loadingText }}</p>
    </div>
    <div
      class="state"
      :class="{ hidden: loading }">
      <span class="icon-badge error">
        <AlertTriangle />
      </span>
      <p class="muted">{{ errorText }}</p>
      <button
        class="secondary"
        type="button"
        @click="props.onRetry?.()">
        {{ retryText }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { AlertTriangle, Loader } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    errorText: string
    loading: boolean
    loadingText: string
    onRetry?: () => void
    retryText?: string
  }>(),
  { retryText: 'Try again' },
)
</script>

<style scoped>
.page-load-state {
  display: grid;
  min-height: 100dvh;
  padding: var(--space-6);
  place-content: center;
}

/* Both states share one grid cell: the box keeps the height of the tallest one and never jumps on switch */
.state {
  display: grid;
  gap: var(--space-3);
  grid-area: 1 / 1;
  justify-items: center;
  text-align: center;
}

.state.hidden {
  visibility: hidden;
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
</style>
