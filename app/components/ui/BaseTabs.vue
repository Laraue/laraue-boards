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
        <BaseBadge v-if="item.count">{{ item.count }}</BaseBadge>
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
/* A segmented control: a soft track, as wide as its tabs, with the active tab raised on it. */
.base-tabs-list {
  background: var(--color-hover);
  border-radius: var(--radius-control);
  display: flex;
  gap: 2px;
  height: var(--control-height);
  max-width: 100%;
  overflow-x: auto;
  padding: 3px;
  scrollbar-width: none;
  width: fit-content;
}

/* A tab: icon, name and count. */
.base-tabs-tab {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  color: var(--color-muted);
  display: inline-flex;
  flex: none;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  gap: var(--space-2);
  justify-content: center;
  padding: 0 var(--space-3);
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.base-tabs-tab > svg {
  height: var(--icon-size);
  width: var(--icon-size);
}

.base-tabs-tab[data-state='active'] {
  background: var(--color-surface);
  box-shadow: var(--shadow-control);
  color: var(--color-text);
}

/* On the dark track the surface would sink; the active tab lightens instead. */
:root[data-theme='dark'] .base-tabs-tab[data-state='active'] {
  background: color-mix(in srgb, var(--color-text) 10%, var(--color-hover));
  border-color: var(--color-border);
}

.base-tabs-tab:focus-visible {
  border-color: var(--color-focus);
  box-shadow: none;
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
