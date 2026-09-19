<template>
  <BillingPage :deps="deps" />
</template>

<script setup lang="ts">
import BillingPage from '~/sections/billing/BillingPage.vue'
import { createBillingPageDeps } from '~/sections/billing/deps-impl'

const deps = createBillingPageDeps(useApiClient())
</script>
