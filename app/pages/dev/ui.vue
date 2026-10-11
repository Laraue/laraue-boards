<template>
  <UiShowcasePage />
</template>

<script setup lang="ts">
import UiShowcasePage from '~/sections/dev/UiShowcasePage.vue'

// The component showcase is a development tool; production answers 404.
if (!import.meta.dev) {
  throw createError({ statusCode: 404 })
}

definePageMeta({ layout: 'public' })
</script>
