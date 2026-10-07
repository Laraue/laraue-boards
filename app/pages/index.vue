<template>
  <LandingPage
    :deps="deps"
    locale="en" />
</template>

<script setup lang="ts">
import { createLandingPageDeps } from '~/sections/landing/LandingPage.deps.impl'
import LandingPage from '~/sections/landing/LandingPage.vue'

definePageMeta({ layout: 'landing' })

const deps = createLandingPageDeps(useBillingApiClient())
</script>
