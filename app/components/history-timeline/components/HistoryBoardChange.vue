<template>
  <span>{{ change.label }}:</span>
  <div class="history-value-change">
    <span :title="change.oldValue">
      <BoardIcon :style="{ color: change.oldColor ?? undefined }" />
      {{ change.oldValue }}
    </span>
    <ArrowRight />
    <span
      class="history-new-value"
      :title="change.newValue">
      <BoardIcon :style="{ color: change.newColor ?? undefined }" />
      {{ change.newValue }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

import { BoardIcon } from '~/constants/icons'

import type { HistoryBoardChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryBoardChangeViewModel }>()
</script>
