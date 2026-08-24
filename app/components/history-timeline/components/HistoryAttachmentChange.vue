<template>
  <span>{{ change.label }}:</span>
  <div class="history-values">
    <span
      class="history-new-value"
      :title="change.newValue">
      <a
        v-if="change.imageUrl"
        :aria-label="`Open ${change.newValue}`"
        class="history-attachment"
        :href="change.imageUrl"
        target="_blank">
        <img
          :alt="change.newValue"
          :src="change.imageUrl" />
      </a>
      {{ change.newValue }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { HistoryAttachmentChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryAttachmentChangeViewModel }>()
</script>

<style scoped>
.history-values,
.history-new-value {
  align-items: center;
  display: flex;
  gap: var(--space-1);
  min-width: 0;
}

.history-values {
  flex: 1;
}

.history-new-value {
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-attachment {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-small);
  flex: 0 0 auto;
  height: 24px;
  overflow: hidden;
  width: 24px;
}

.history-attachment img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}
</style>
