<!-- Tabs that switch pages: links in the BaseTabs track, the current one marked aria-current. A tab is
     current while the route is inside its link; `exact` limits that to the link itself, and `active`
     overrides it when the routes are not nested. -->
<template>
  <nav
    :aria-label="label"
    class="base-tabs-list">
    <NuxtLink
      v-for="item in items"
      :key="item.label"
      v-slot="{ href, isActive, isExactActive, navigate }"
      custom
      :to="item.to">
      <a
        :aria-current="(item.active ?? (item.exact ? isExactActive : isActive)) ? 'page' : undefined"
        class="base-tabs-tab"
        :href="href"
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
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  items: Array<{
    active?: boolean
    exact?: boolean
    icon?: Component
    label: string
    to: RouteLocationRaw
  }>
  label: string
}>()
</script>
