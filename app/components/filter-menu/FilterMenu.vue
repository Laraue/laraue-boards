<!-- A Filters button with its panel: a header with Clear all, and the filters as rows; a row opens its
     editor (the `panel` slot) under it. The issue list and the organization's history use it. -->
<template>
  <BasePopover
    align="end"
    class="filter-menu-popover">
    <template #trigger="{ open, toggle }">
      <BaseButton
        :aria-expanded="open"
        aria-haspopup="dialog"
        :loading="loading"
        @click="toggle">
        <IconFilter v-if="!loading" />
        {{ t('filters') }}
        <span v-if="activeCount">({{ activeCount }})</span>
      </BaseButton>
    </template>
    <div class="filter-menu">
      <div class="filter-menu-header">
        <span>{{ label }}</span>
        <BaseIconButton
          :disabled="!activeCount"
          :label="t('clearAll')"
          @click="onClear">
          <IconFilterOff />
        </BaseIconButton>
      </div>
      <nav :aria-label="label">
        <div
          v-for="item in items"
          :key="item.id"
          class="filter-item">
          <BaseButton
            :aria-controls="`${idPrefix}-${item.id}-panel`"
            :aria-expanded="activeId === item.id"
            :data-active="activeId === item.id || undefined"
            menu
            @click="activeId = activeId === item.id ? undefined : item.id">
            <component
              :is="item.icon"
              aria-hidden="true"
              :style="{ color: item.color }" />
            <span class="filter-label">{{ item.label }}</span>
            <small v-if="item.count">{{ item.count }}</small>
            <IconChevronRight
              aria-hidden="true"
              class="submenu-chevron"
              :class="{ expanded: activeId === item.id }" />
          </BaseButton>
          <section
            v-if="activeId === item.id"
            :id="`${idPrefix}-${item.id}-panel`"
            :aria-label="item.label"
            class="filter-editor">
            <slot
              :id="`${idPrefix}-${item.id}`"
              :item="item"
              name="panel" />
          </section>
        </div>
      </nav>
    </div>
  </BasePopover>
</template>

<script setup lang="ts" generic="T extends FilterMenuItem">
import { IconChevronRight, IconFilter, IconFilterOff } from '@tabler/icons-vue'

import type { FilterMenuItem } from './FilterMenu.types'

defineProps<{
  activeCount: number
  items: T[]
  // Names the panel and its list of filters, such as "Issue filters".
  label: string
  loading?: boolean
  onClear: () => void
}>()

defineSlots<{
  // The editor of an opened filter; `id` prefixes the ids of its fields.
  panel: (props: { id: string; item: T }) => unknown
}>()

const { t } = useI18n({
  en: { clearAll: 'Clear all', filters: 'Filters' },
  ru: { clearAll: 'Очистить всё', filters: 'Фильтры' },
})

const idPrefix = useId()
const activeId = ref<string>()
</script>

<style scoped>
.filter-menu-popover {
  --base-popover-width: min(320px, calc(100vw - var(--space-8)));
}

.filter-menu {
  min-width: 0;
  padding: var(--space-1);
  width: 100%;
}

.filter-menu-header {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-1);
  padding-left: var(--space-3);
}

.filter-menu nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.filter-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.submenu-chevron {
  flex: none;
  height: 12px;
  margin-left: auto;
  width: 12px;
}

.submenu-chevron.expanded {
  rotate: 90deg;
}

.filter-editor {
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - var(--space-8));
  min-width: 0;
  overflow-y: auto;
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
  width: 100%;
}
</style>
