<template>
  <BillingPage
    :deps="deps"
    :on-buy-tokens="() => navigateTo(organizationRoutes.accountPlanTokens())"
    :on-change-plan="() => navigateTo(organizationRoutes.accountPlanChange())" />
</template>

<script setup lang="ts">
import { createBillingPageDeps } from '~/sections/billing/plan/BillingPage.deps.impl'
import BillingPage from '~/sections/billing/plan/BillingPage.vue'

const { t } = useI18n({
  en: { plan: 'Plan and usage' },
  ru: { plan: 'Тариф и лимиты' },
})

const deps = createBillingPageDeps(useApiClient())

const organizationRoutes = useOrganizationRoutes()

useHead({ title: t('plan') })
</script>
