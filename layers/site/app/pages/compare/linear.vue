<template>
  <LinearComparePage />
</template>

<script setup lang="ts">
import { definePageMeta } from '#app/composables/pages'
import LinearComparePage from '#layers/site/app/sections/compare/LinearComparePage.vue'

definePageMeta({ layout: 'landing' })
</script>
