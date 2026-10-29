<!-- A quiet link back to the page above, as a line over a section's title: "← Back to attributes". -->
<template>
  <NuxtLink
    class="app-back-link"
    :to="to">
    <IconArrowLeft aria-hidden="true" />
    {{ label }}
  </NuxtLink>
</template>

<script setup lang="ts">
import { IconArrowLeft } from '@tabler/icons-vue'
import type { RouteLocationRaw } from 'vue-router'

import { NuxtLink } from '#components'

defineProps<{ label: string; to: RouteLocationRaw }>()
</script>

<style scoped>
.app-back-link {
  align-items: center;
  border-radius: var(--radius-small);
  color: var(--color-muted);
  display: inline-flex;
  font-size: var(--font-size-sm);
  gap: var(--space-1);
  text-decoration: none;
}

.app-back-link:hover {
  color: var(--color-text);
}

.app-back-link:focus-visible {
  box-shadow: var(--shadow-focus);
  outline: none;
}

.app-back-link > svg {
  flex: none;
  height: var(--icon-size);
  width: var(--icon-size);
}
</style>
