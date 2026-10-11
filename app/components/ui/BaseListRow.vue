<!-- A row of BaseList: something in front (an icon or avatar), the title with an optional line under
     it, and actions at the end. With `to` the whole row is a link and ends in a chevron. -->
<template>
  <component
    :is="to ? NuxtLink : 'div'"
    class="base-list-row"
    :class="{ link: to }"
    :to="to">
    <span
      v-if="$slots.leading"
      class="base-list-row-leading">
      <slot name="leading" />
    </span>
    <span class="base-list-row-text">
      <span class="base-list-row-title"><slot /></span>
      <span
        v-if="description || $slots.description"
        class="base-list-row-description">
        <slot name="description">{{ description }}</slot>
      </span>
    </span>
    <span
      v-if="$slots.trailing || to"
      class="base-list-row-trailing">
      <slot name="trailing" />
      <IconChevronRight
        v-if="to"
        class="base-list-row-chevron" />
    </span>
  </component>
</template>

<script setup lang="ts">
import { IconChevronRight } from '@tabler/icons-vue'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{ description?: string; to?: RouteLocationRaw }>()

const NuxtLink = resolveComponent('NuxtLink')
</script>

<style scoped>
.base-list-row {
  align-items: center;
  color: var(--color-text);
  display: flex;
  /* On a narrow row the actions drop under the text instead of squeezing it. */
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
  min-height: 2.75rem;
  padding: var(--space-2) var(--space-4);
  text-decoration: none;
}

.base-list-row + .base-list-row {
  border-top: 1px solid var(--color-divider);
}

/* A row picked with its checkbox stays marked. */
.base-list-row:has(> .base-list-row-leading input:checked) {
  background: var(--color-accent-soft);
}

.base-list-row.link:hover {
  background: var(--color-soft);
}

.base-list-row.link:focus-visible {
  box-shadow: var(--shadow-focus);
  outline: none;
}

.base-list-row-leading {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  flex: none;
  gap: var(--space-3);
}

.base-list-row-leading > :deep(svg) {
  height: var(--icon-size);
  width: var(--icon-size);
}

.base-list-row-text {
  display: grid;
  flex: 1 1 12rem;
  gap: 2px;
  min-width: 0;
}

.base-list-row-title {
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.base-list-row-description {
  color: var(--color-muted);
  font-size: var(--font-size-sm);
}

.base-list-row-trailing {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--space-2);
}

.base-list-row-chevron {
  color: var(--color-muted);
  height: var(--icon-size);
  width: var(--icon-size);
}
</style>
