<template>
  <BaseIconButton
    :label="label"
    :to="to">
    <IconArrowLeft />
  </BaseIconButton>
</template>

<script setup lang="ts">
import { IconArrowLeft } from '@tabler/icons-vue'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{ label: string; to: RouteLocationRaw }>()
</script>
