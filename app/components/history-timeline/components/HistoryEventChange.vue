<template>
  <span>{{ change.label }}</span>
</template>

<script setup lang="ts">
import type { HistoryEventChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryEventChangeViewModel }>()
</script>
