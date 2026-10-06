<template>
  <BillingPage
    :deps="deps"
    :on-change-plan="() => navigateTo(organizationRoutes.accountPlanChange())" />
</template>

<script setup lang="ts">
import { createBillingPageDeps } from '~/sections/billing/BillingPage.deps.impl'
import BillingPage from '~/sections/billing/BillingPage.vue'
import type { TariffsFetcher } from '~/sections/landing/LandingPage.deps.impl'

const { t } = useI18n({
  en: { plan: 'Plan and usage' },
  ru: { plan: 'Тариф и лимиты' },
})

// `useRequestFetch()` is typed with every route of the app, which TypeScript cannot compare with a
// plain function type (excessive stack depth), so it is narrowed to what the plans use.
const deps = createBillingPageDeps(useApiClient(), useRequestFetch() as unknown as TariffsFetcher)

const organizationRoutes = useOrganizationRoutes()

useHead({ title: t('plan') })
</script>
