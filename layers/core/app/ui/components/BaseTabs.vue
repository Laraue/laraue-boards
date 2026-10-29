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

import BaseBadge from '#layers/core/app/ui/components/BaseBadge.vue'

defineProps<{
  // count: how many things the tab holds, shown next to its name when there are any.
  items: Array<{ count?: number; icon?: Component; label: string; value: T }>
  label: string
}>()

const model = defineModel<T>({ required: true })
</script>

<style scoped>
.base-tabs-panel {
  padding-top: var(--space-4);
}

.base-tabs-panel:focus-visible {
  box-shadow: none;
}
</style>
