<template>
  <span>{{ change.label }}:</span>
  <div class="history-value-change">
    <span :title="change.oldValue">
      <SpaceIcon :style="{ color: change.oldColor ?? undefined }" />
      {{ change.oldValue }}
    </span>
    <ArrowRight />
    <span
      class="history-new-value"
      :title="change.newValue">
      <SpaceIcon :style="{ color: change.newColor ?? undefined }" />
      {{ change.newValue }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

import { SpaceIcon } from '~/constants/icons'

import type { HistorySpaceChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistorySpaceChangeViewModel }>()
</script>
