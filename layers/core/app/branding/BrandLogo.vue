<template>
  <component
    :is="to ? NuxtLink : 'div'"
    class="logo"
    :to="to">
    <img
      alt=""
      class="logo-mark"
      :src="laraueLogoUrl" />
    <span>Laraue Boards</span>
  </component>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

import { NuxtLink } from '#components'

import { laraueLogoUrl } from './laraueIcons'

defineProps<{ to?: RouteLocationRaw }>()
</script>

<style scoped>
.logo {
  align-items: center;
  color: var(--color-text);
  display: flex;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  gap: var(--space-2);
  letter-spacing: -0.03em;
  /* Whole pixels, and not inherited: the landing page and the app have different line heights. */
  line-height: 20px;
  text-decoration: none;
}

.logo-mark {
  display: block;
  flex: none;
  height: 28px;
  width: 28px;
}
</style>
