<template>
  <svg
    aria-hidden="true"
    class="issue-status-indicator"
    :style="{ color }"
    viewBox="0 0 16 16">
    <circle
      cx="8"
      cy="8"
      fill="none"
      r="5.5"
      stroke="currentColor"
      stroke-width="1.5" />
    <circle
      v-if="category === 'Completed'"
      cx="8"
      cy="8"
      fill="currentColor"
      r="3" />
    <path
      v-else-if="category === 'InProgress'"
      d="M8 4a4 4 0 0 1 0 8Z"
      fill="currentColor" />
  </svg>
</template>

<script setup lang="ts">
import type { components } from '#infrastructure/api/generated'

defineProps<{
  category?: components['schemas']['StatusCategory']
  color: string
}>()
</script>

<style scoped>
.issue-status-indicator {
  flex: none;
  height: 16px;
  width: 16px;
}
</style>
