<template>
  <TrelloComparePage />
</template>

<script setup lang="ts">
import { definePageMeta } from '#app/composables/pages'
import TrelloComparePage from '#layers/site/app/sections/compare/TrelloComparePage.vue'

definePageMeta({ layout: 'landing' })
</script>
