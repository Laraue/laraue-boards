<template>
  <NuxtLink
    :aria-label="label"
    class="icon-btn"
    :to="to">
    <IconArrowLeft />
  </NuxtLink>
</template>

<script setup lang="ts">
import { IconArrowLeft } from '@tabler/icons-vue'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{ label: string; to: RouteLocationRaw }>()
</script>
