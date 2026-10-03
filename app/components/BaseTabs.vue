<template>
  <!-- Hidden panels stay mounted, so a draft in one survives switching tabs. -->
  <TabsRoot
    v-model="model"
    class="base-tabs"
    :unmount-on-hide="false">
    <TabsList
      :aria-label="label"
      class="base-tabs-list">
      <TabsTrigger
        v-for="item in items"
        :key="item.value"
        class="base-tabs-tab"
        :value="item.value">
        <component
          :is="item.icon"
          v-if="item.icon" />
        {{ item.label }}
        <span
          v-if="item.count"
          class="base-tabs-count">
          {{ item.count }}
        </span>
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="item in items"
      :key="item.value"
      class="base-tabs-panel"
      :value="item.value">
      <slot :name="item.value" />
    </TabsContent>
  </TabsRoot>
</template>

<script setup lang="ts" generic="T extends string">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import type { Component } from 'vue'

defineProps<{
  // count: how many things the tab holds, shown next to its name when there are any.
  items: Array<{ count?: number; icon?: Component; label: string; value: T }>
  label: string
}>()

const model = defineModel<T>({ required: true })
</script>

<style scoped>
/* As Linear's "Activity": a line across ends what is above, then the tabs read as the section's
   heading, the active one bright and the others muted. */
.base-tabs {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-5);
}

.base-tabs-list {
  display: flex;
  gap: var(--space-5);
  overflow-x: auto;
  scrollbar-width: none;
}

/* A tab: icon, name and count. */
.base-tabs-tab {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  /* Fainter than muted text, so the active one stands apart from the rest. */
  color: color-mix(in srgb, var(--color-muted) 60%, transparent);
  display: inline-flex;
  flex: none;
  font-size: 15px;
  /* One weight for every state: a bolder active tab would shift the ones after it. */
  font-weight: var(--font-weight-semibold);
  gap: var(--space-2);
  height: var(--control-height);
  padding: 0;
  transition: color var(--duration-fast) var(--ease-standard);
}

.base-tabs-tab > svg {
  height: 18px;
  width: 18px;
}

.base-tabs-count {
  background: var(--color-hover);
  border-radius: var(--radius-pill);
  color: var(--color-muted);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  line-height: 20px;
  min-width: 20px;
  padding: 0 var(--space-1);
  text-align: center;
}

.base-tabs-tab[data-state='active'] {
  color: var(--color-text);
}

.base-tabs-tab[data-state='active'] .base-tabs-count {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.base-tabs-tab:focus-visible {
  box-shadow: var(--shadow-focus);
  color: var(--color-text);
}

.base-tabs-panel {
  padding-top: var(--space-4);
}

.base-tabs-panel:focus-visible {
  box-shadow: none;
}

@media (hover: hover) and (pointer: fine) {
  .base-tabs-tab:hover:not([data-state='active']) {
    color: var(--color-muted);
  }
}
</style>
