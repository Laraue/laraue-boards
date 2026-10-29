<!-- Tabs that switch pages: links in the BaseTabs track, the current one marked aria-current. A tab is
     current while the route is inside its link; `exact` limits that to the link itself, and `active`
     overrides it when the routes are not nested. `vertical` lists them as rows, for a settings menu. -->
<template>
  <nav
    :aria-label="label"
    :class="vertical ? 'base-nav-list' : 'base-tabs-list'">
    <NuxtLink
      v-for="item in items"
      :key="item.label"
      v-slot="{ href, isActive, isExactActive, navigate }"
      custom
      :to="item.to">
      <a
        :aria-current="
          (item.active ?? (item.exact ? isExactActive : isActive)) ? 'page' : undefined
        "
        :class="vertical ? 'base-nav-row' : 'base-tabs-tab'"
        :href="href ?? undefined"
        @click="navigate">
        <component
          :is="item.icon"
          v-if="item.icon" />
        {{ item.label }}
      </a>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

import type { NavTab } from './BaseNavTabs.types'

withDefaults(
  defineProps<{
    items: NavTab[]
    label: string
    vertical?: boolean
  }>(),
  { vertical: false },
)
</script>

<style scoped>
/* Rows like the app sidebar's; the current one takes a neutral fill, so it doesn't compete with the
   sidebar's accent. */
.base-nav-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.base-nav-row {
  align-items: center;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  color: var(--color-muted);
  display: flex;
  flex: none;
  gap: var(--space-2);
  height: var(--control-height);
  padding: 0 var(--space-3);
  text-decoration: none;
  white-space: nowrap;
}

.base-nav-row > svg {
  height: var(--icon-size);
  width: var(--icon-size);
}

.base-nav-row:hover {
  background: var(--color-soft);
  color: var(--color-text);
}

.base-nav-row[aria-current='page'] {
  /* A step darker than the hover fill, so the current section never looks merely hovered. */
  background: var(--color-hover);
  color: var(--color-text);
}

.base-nav-row:focus-visible {
  border-color: var(--color-focus);
  box-shadow: none;
}
</style>
