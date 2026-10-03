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
.base-tabs-list {
  border-bottom: 1px solid var(--color-divider);
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
  border-bottom: 1px solid transparent;
  border-radius: 0;
  color: var(--color-muted);
  display: inline-flex;
  flex: none;
  font-size: var(--font-size-body);
  font-weight: 400;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-2);
  transition: color var(--duration-fast) var(--ease-standard);
}

.base-tabs-tab > svg {
  height: var(--icon-size);
  width: var(--icon-size);
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
  border-bottom-color: var(--color-accent);
  color: var(--color-accent);
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
    color: var(--color-text);
  }
}
</style>
