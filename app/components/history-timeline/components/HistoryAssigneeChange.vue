<template>
  <span>{{ change.label }}:</span>
  <div class="history-value-change">
    <span :title="change.oldValue">
      <span
        v-if="change.oldValue !== 'None'"
        class="avatar"
        :style="{ background: change.oldColor ?? 'var(--color-border)' }">
        {{ initials(change.oldValue) }}
      </span>
      <i
        v-else-if="change.oldColor"
        :style="{ background: change.oldColor }" />
      {{ change.oldValue }}
    </span>
    <ArrowRight />
    <span
      class="history-new-value"
      :title="change.newValue">
      <span
        v-if="change.newValue !== 'None'"
        class="avatar"
        :style="{ background: change.newColor ?? 'var(--color-border)' }">
        {{ initials(change.newValue) }}
      </span>
      <i
        v-else-if="change.newColor"
        :style="{ background: change.newColor }" />
      {{ change.newValue }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

import type { HistoryAssigneeChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryAssigneeChangeViewModel }>()

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
</script>
