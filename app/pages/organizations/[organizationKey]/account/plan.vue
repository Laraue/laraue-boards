<template>
  <BillingPage :deps="deps" />
</template>

<script setup lang="ts">
import { createBillingPageDeps } from '~/sections/billing/BillingPage.deps.impl'
import BillingPage from '~/sections/billing/BillingPage.vue'

const { t } = useI18n({
  en: { plan: 'Plan and usage' },
  ru: { plan: 'Тариф и лимиты' },
})

const deps = createBillingPageDeps(useApiClient())

useHead({ title: t('plan') })
</script>
