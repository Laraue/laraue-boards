<template>
  <LandingPage
    :deps="deps"
    locale="ru" />
</template>

<script setup lang="ts">
import { createLandingPageDeps } from '~/sections/landing/deps-impl'
import type { TariffsFetcher } from '~/sections/landing/deps-impl/fetchTariffs'
import LandingPage from '~/sections/landing/LandingPage.vue'

definePageMeta({ layout: 'landing' })

// `useRequestFetch()` is typed with every route of the app, which TypeScript cannot compare with a
// plain function type (excessive stack depth), so it is narrowed to what the landing page uses.
const deps = createLandingPageDeps(useRequestFetch() as unknown as TariffsFetcher)
</script>
