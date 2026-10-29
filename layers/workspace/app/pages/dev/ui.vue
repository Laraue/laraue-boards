<template>
  <UiShowcasePage />
</template>

<script setup lang="ts">
import { createError } from '#app'
import { definePageMeta } from '#app/composables/pages'
import UiShowcasePage from '#layers/workspace/app/sections/dev/UiShowcasePage.vue'

// The component showcase is a development tool; production answers 404.
if (!import.meta.dev) {
  throw createError({ statusCode: 404 })
}

definePageMeta({ layout: 'public' })
</script>
