<template>
  <span>{{ change.label }}:</span>
  <div class="history-value-change">
    <span :title="change.oldValue">
      <i
        v-if="change.oldColor"
        :style="{ background: change.oldColor }" />
      {{ change.oldValue }}
    </span>
    <ArrowRight />
    <span
      class="history-new-value"
      :title="change.newValue">
      <i
        v-if="change.newColor"
        :style="{ background: change.newColor }" />
      {{ change.newValue }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

import type { HistoryPropertyChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryPropertyChangeViewModel }>()
</script>
