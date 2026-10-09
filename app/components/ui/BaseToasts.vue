<template>
  <Teleport to="body">
    <div
      aria-live="polite"
      class="toasts">
      <TransitionGroup name="list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="toast.tone">
          <IconAlertTriangle v-if="toast.tone === 'error'" />
          <IconCheck v-else />
          <p>{{ toast.message }}</p>
          <span
            v-if="toast.count > 1"
            class="toast-count">
            {{ toast.count }}
          </span>
          <BaseIconButton
            :label="dismissLabel"
            @click="dismiss(toast.id)">
            <IconX />
          </BaseIconButton>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-vue'

// The kit has no translations of its own: the app passes its words in.
withDefaults(defineProps<{ dismissLabel?: string }>(), { dismissLabel: 'Dismiss' })

const { dismiss, toasts } = useToast()
</script>

<style scoped>
.toasts {
  display: grid;
  gap: var(--space-2);
  justify-items: center;
  left: 50%;
  pointer-events: none;
  position: fixed;
  top: var(--space-4);
  translate: -50% 0;
  width: min(420px, calc(100% - var(--space-6) * 2));
  z-index: 40;
}

.toast {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  box-shadow: var(--shadow-popover);
  display: flex;
  gap: var(--space-3);
  /* Less on the right: the dismiss button brings its own space. */
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
  pointer-events: auto;
  width: 100%;
}

.toast p {
  flex: 1;
  margin: 0;
  min-width: 0;
  white-space: pre-line;
}

.toast > .tabler-icon {
  flex: none;
}

.toast.error > .tabler-icon {
  color: var(--color-danger);
}

.toast.success > .tabler-icon {
  color: var(--color-success);
}

.toast-count {
  background: var(--color-soft);
  border-radius: var(--radius-full);
  color: var(--color-muted);
  flex: none;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  padding: 0 var(--space-2);
}

@media (max-width: 600px) {
  .toasts {
    width: calc(100% - var(--space-3) * 2);
  }
}
</style>
