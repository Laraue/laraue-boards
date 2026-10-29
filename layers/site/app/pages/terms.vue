<template>
  <TermsPage />
</template>

<script setup lang="ts">
import { definePageMeta } from '#app/composables/pages'
import TermsPage from '#layers/site/app/sections/legal/TermsPage.vue'

definePageMeta({ layout: 'landing' })
</script>
