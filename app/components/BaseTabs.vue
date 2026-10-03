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
        {{ item.label }}
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

defineProps<{
  items: Array<{ label: string; value: T }>
  label: string
}>()

const model = defineModel<T>({ required: true })
</script>

<style scoped>
/* Lines are inset shadows, not borders: the list scrolls, which would clip a tab's line laid over
   the list's. */
.base-tabs-list {
  box-shadow: inset 0 -1px 0 var(--color-divider);
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  scrollbar-width: none;
}

.base-tabs-tab {
  background: transparent;
  border: 0;
  color: var(--color-muted);
  flex: none;
  height: var(--control-height);
  padding: 0 var(--space-1);
  transition: color var(--duration-fast) var(--ease-standard);
}

.base-tabs-tab[data-state='active'] {
  box-shadow: inset 0 -1px 0 var(--color-accent);
  color: var(--color-accent);
}

.base-tabs-tab:focus-visible {
  box-shadow: var(--shadow-focus);
  color: var(--color-text);
}

.base-tabs-tab[data-state='active']:focus-visible {
  box-shadow:
    inset 0 -1px 0 var(--color-accent),
    var(--shadow-focus);
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
