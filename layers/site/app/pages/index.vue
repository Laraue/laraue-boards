<template>
  <LandingPage :deps="deps" />
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#app'
import { definePageMeta } from '#app/composables/pages'
import { createBillingApiClient } from '#infrastructure/api/client'
import { createLandingPageDeps } from '#layers/site/app/sections/landing/LandingPage.deps.impl'
import LandingPage from '#layers/site/app/sections/landing/LandingPage.vue'

definePageMeta({ layout: 'landing' })

const deps = createLandingPageDeps(
  createBillingApiClient({ baseUrl: useRuntimeConfig().public.billingApiBaseUrl }),
)
</script>
