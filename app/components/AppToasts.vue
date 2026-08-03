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
          <AlertTriangle v-if="toast.tone === 'error'" />
          <Check v-else />
          <p>{{ toast.message }}</p>
          <span
            v-if="toast.count > 1"
            class="toast-count">
            {{ toast.count }}
          </span>
          <button
            aria-label="Dismiss"
            class="icon-btn small"
            type="button"
            @click="dismiss(toast.id)">
            <X />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle, Check, X } from '@lucide/vue'

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
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-popover);
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  pointer-events: auto;
  width: 100%;
}

.toast p {
  flex: 1;
  margin: 0;
  min-width: 0;
  white-space: pre-line;
}

.toast > .lucide {
  flex: none;
}

.toast.error > .lucide {
  color: var(--color-danger);
}

.toast.success > .lucide {
  color: var(--color-success);
}

.toast-count {
  background: var(--color-soft);
  border-radius: var(--radius-pill);
  color: var(--color-muted);
  flex: none;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  padding: 0 var(--space-2);
}

.toast .icon-btn {
  background: none;
  border: 0;
  color: var(--color-muted);
  flex: none;
}

@media (max-width: 600px) {
  .toasts {
    width: calc(100% - var(--space-3) * 2);
  }
}
</style>
