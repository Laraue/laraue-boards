<template>
  <TokenPacksPage
    :back-to="organizationRoutes.accountPlan()"
    :deps="deps"
    :on-pay="(url) => navigateTo(url, { external: true })" />
</template>

<script setup lang="ts">
import { createBillingPageDeps } from '~/sections/billing/BillingPage.deps.impl'
import TokenPacksPage from '~/sections/billing/TokenPacksPage.vue'
import type { TariffsFetcher } from '~/sections/landing/LandingPage.deps.impl'

const { t } = useI18n({
  en: { plan: 'Buy tokens' },
  ru: { plan: 'Купить токены' },
})

// `useRequestFetch()` is typed with every route of the app, which TypeScript cannot compare with a
// plain function type (excessive stack depth), so it is narrowed to what the plans use.
const deps = createBillingPageDeps(useApiClient(), useRequestFetch() as unknown as TariffsFetcher)

const organizationRoutes = useOrganizationRoutes()

useHead({ title: t('plan') })
</script>
