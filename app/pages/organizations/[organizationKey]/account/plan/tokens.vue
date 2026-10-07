<template>
  <TokenPacksPage
    :back-to="organizationRoutes.accountPlan()"
    :deps="deps"
    :on-pay="(url) => navigateTo(url, { external: true })" />
</template>

<script setup lang="ts">
import { createTokenPacksPageDeps } from '~/sections/billing/token-packs/TokenPacksPage.deps.impl'
import TokenPacksPage from '~/sections/billing/token-packs/TokenPacksPage.vue'

const { t } = useI18n({
  en: { plan: 'Buy tokens' },
  ru: { plan: 'Купить токены' },
})

const deps = createTokenPacksPageDeps(useApiClient(), useBillingApiClient())

const organizationRoutes = useOrganizationRoutes()

useHead({ title: t('plan') })
</script>
