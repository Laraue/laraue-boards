<!-- The header of a page outside an organization: a way back, the title, and the page's action at the
     end, as the page header inside one. -->
<template>
  <header class="standalone-page-header">
    <AppBackLink
      :label="backLabel"
      :to="backTo" />
    <h1>{{ title }}</h1>
    <div
      v-if="$slots.actions"
      class="standalone-page-header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{ backLabel: string; backTo: RouteLocationRaw; title: string }>()
</script>

<style scoped>
.standalone-page-header {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height);
}

h1 {
  font-size: var(--font-size-title);
  margin: 0;
  min-width: 0;
}

.standalone-page-header-actions {
  display: flex;
  flex: none;
  gap: var(--space-2);
  margin-left: auto;
}
</style>
